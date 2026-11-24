import { orderRepository } from "./order.repository.js";
import { userRepository } from "../users/user.repository.js";
import { settingsRepository } from "../settings/settings.repository.js";
import { httpError } from "../../utils/httpError.js";
import { OPEN_ORDER_STATUSES, FINAL_ORDER_STATUSES, ORDER_TRANSITIONS } from "./order.constants.js";
import { can, MANAGE_PERMISSIONS } from "../access/access.service.js";
import { FORBIDDEN_MESSAGE } from "../../middlewares/permission.middleware.js";

// La entrada llega validada por order.schema.js (mesa, items y cantidades enteras > 0,
// estado válido). Aquí solo quedan las reglas de negocio que requieren la BD.

// Un mismo platillo repetido en varias filas se consolida sumando cantidades.
const mergeItems = (items) => {
  const byProduct = new Map();
  for (const { productId, quantity } of items) {
    byProduct.set(productId, (byProduct.get(productId) ?? 0) + quantity);
  }
  return [...byProduct].map(([productId, quantity]) => ({ productId, quantity }));
};

// Precio vigente desde la BD (nunca el enviado por el cliente) y solo platillos habilitados.
const priceNewItem = (item, productsById) => {
  const product = productsById.get(item.productId);
  if (!product) throw httpError(400, `El producto ${item.productId} no existe`);
  if (!product.is_available) {
    throw httpError(400, `El producto "${product.product_name}" no está disponible`);
  }
  return { ...item, unitPrice: product.price, dispatched: false };
};

// ¿El PUT solo cambia el estado entre los dos estados abiertos? (permiso prepare_order)
// Mesa, mesero, observaciones y platillos deben llegar iguales a los guardados.
function isOnlyPrepareChange(current, { tableNumber, waiterId, status, observations, items }) {
  const sameItems = (list, map) =>
    list.length === map.size &&
    list.every(({ productId, quantity }) => map.get(productId) === quantity);
  const currentItems = new Map(mergeItems(current.items).map((i) => [i.productId, i.quantity]));
  return (
    OPEN_ORDER_STATUSES.includes(status) &&
    tableNumber === current.tableNumber &&
    (waiterId == null || waiterId === current.waiterId) &&
    (observations ?? "") === (current.observations ?? "") &&
    sameItems(mergeItems(items), currentItems)
  );
}

// El mesero indicado debe existir y estar activo (H51).
async function assertActiveWaiter(waiterId) {
  const user = await userRepository.getById(waiterId);
  if (!user || !user.is_active) {
    throw httpError(400, "El empleado encargado no existe o está inactivo");
  }
}

// La mesa debe existir según la configuración del restaurante (1..table_count)
async function assertTableExists(tableNumber) {
  const { tableCount } = await settingsRepository.get();
  if (tableNumber > tableCount) {
    throw httpError(400, `La mesa ${tableNumber} no existe: el restaurante tiene ${tableCount} mesas`);
  }
}

export const orderService = {
  // Listado con filtros opcionales y paginación opcional (ver utils/listQuery.js)
  async list(query) {
    return await orderRepository.list(query);
  },

  async getById(id) {
    return await orderRepository.getById(id);
  },

  async getReportData(tableNumber) {
    return await orderRepository.getReportData(tableNumber ?? null);
  },

  // currentUserId: usuario autenticado (req.user.id). Si no se indica mesero, es él.
  async create({ tableNumber, waiterId, observations, items }, currentUserId) {
    await assertTableExists(tableNumber);
    if (waiterId != null) {
      await assertActiveWaiter(waiterId);
    }

    const merged = mergeItems(items);
    const products = await orderRepository.getProductsByIds(merged.map((i) => i.productId));
    const productsById = new Map(products.map((p) => [p.id, p]));
    const pricedItems = merged.map((item) => priceNewItem(item, productsById));

    return await orderRepository.create(
      { tableNumber, waiterId: waiterId ?? currentUserId, observations: observations ?? null },
      pricedItems
    );
  },

  // auth: req.auth ({ isSuperuser, permissions }). La ruta ya exige update_order o prepare_order.
  async update(id, { tableNumber, waiterId, status, observations, items }, currentUserId, auth) {
    const current = await orderRepository.getById(id);
    if (!current) return undefined;

    // RFADMIN28: pagada y cancelada son estados finales
    if (FINAL_ORDER_STATUSES.includes(current.status)) {
      throw httpError(409, `No se puede modificar una orden en estado "${current.status}"`);
    }
    if (status === "pagada") {
      throw httpError(409, "Para pagar una orden genera su comprobante de venta");
    }
    if (!ORDER_TRANSITIONS[current.status]?.includes(status)) {
      throw httpError(409, `No se puede pasar una orden de "${current.status}" a "${status}"`);
    }

    // Solo prepare_order (cocina): únicamente el estado activa ↔ lista para entrega
    const canUpdate = can(auth, "update_order");
    if (!canUpdate && !isOnlyPrepareChange(current, { tableNumber, waiterId, status, observations, items })) {
      throw httpError(403, 'Solo puedes cambiar el estado entre "activa" y "lista para entrega"');
    }
    // Anular por PUT exige el mismo permiso que PATCH /:id/cancel
    if (status === "cancelada" && !can(auth, "cancel_order")) {
      throw httpError(403, FORBIDDEN_MESSAGE);
    }
    // Reasignar el mesero es una decisión de administración
    if (waiterId != null && waiterId !== current.waiterId &&
        !(canUpdate && can(auth, MANAGE_PERMISSIONS))) {
      throw httpError(403, "Solo un administrador puede cambiar el mesero de una orden");
    }

    // Solo se valida si cambia la mesa: una orden antigua en una mesa retirada sigue editable
    if (tableNumber !== current.tableNumber) {
      await assertTableExists(tableNumber);
    }

    // Si no se envía mesero se conserva el actual (o el usuario autenticado si no tenía).
    // No se reasigna al usuario que edita: editar no debe cambiar quién atendió la mesa.
    if (waiterId != null && waiterId !== current.waiterId) {
      await assertActiveWaiter(waiterId);
    }
    const finalWaiterId = waiterId ?? current.waiterId ?? currentUserId;

    const merged = mergeItems(items);
    // Los platillos que ya estaban en la orden conservan su precio y estado de despacho
    const previousByProduct = new Map(current.items.map((i) => [i.productId, i]));
    const newIds = merged.map((i) => i.productId).filter((pid) => !previousByProduct.has(pid));
    const products = newIds.length ? await orderRepository.getProductsByIds(newIds) : [];
    const productsById = new Map(products.map((p) => [p.id, p]));

    const pricedItems = merged.map((item) => {
      const previous = previousByProduct.get(item.productId);
      return previous
        ? { ...item, unitPrice: previous.price, dispatched: previous.dispatched }
        : priceNewItem(item, productsById);
    });

    const updated = await orderRepository.update(
      id,
      { tableNumber, waiterId: finalWaiterId, status, observations: observations ?? null },
      pricedItems
    );
    // La orden existía pero pasó a un estado final mientras se editaba
    if (!updated) throw httpError(409, "La orden cambió de estado; recargue e intente de nuevo");
    return updated;
  },

  // Anular = pasar a "cancelada" (no hay borrado físico). Solo órdenes abiertas.
  async cancel(id) {
    const order = await orderRepository.getById(id);
    if (!order) return null;
    if (!OPEN_ORDER_STATUSES.includes(order.status)) {
      throw httpError(409, `No se puede anular una orden en estado "${order.status}"`);
    }
    const cancelled = await orderRepository.cancel(id);
    if (!cancelled) throw httpError(409, "La orden cambió de estado; recargue e intente de nuevo");
    return cancelled;
  },
};
