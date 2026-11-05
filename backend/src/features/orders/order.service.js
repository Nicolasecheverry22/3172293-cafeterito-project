import { orderRepository } from "./order.repository.js";

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// Une filas repetidas del mismo platillo sumando cantidades
// (la tabla order_items tiene UNIQUE (order_id, product_id)).
const mergeItems = (items) => {
  const byProduct = new Map();

  for (const item of items) {
    const productId = toPositiveInt(item.productId);
    const quantity = toPositiveInt(item.quantity);
    if (!productId || !quantity) {
      throw httpError(400, "Cada platillo necesita un producto y una cantidad mayor a 0");
    }
    byProduct.set(productId, (byProduct.get(productId) ?? 0) + quantity);
  }

  return [...byProduct].map(([productId, quantity]) => ({ productId, quantity }));
};

// Deben coincidir con el CHECK chk_orders_status de la migración 0029
const VALID_STATUSES = ["activa", "pagada", "cancelada"];

const normalizeObservations = (value) =>
  typeof value === "string" ? value.trim().slice(0, 300) || null : null;

export const orderService = {
  async getAll() {
    return await orderRepository.getAll();
  },

  async getById(id) {
    return await orderRepository.getById(id);
  },

  async create(data) {
    const tableNumber = toPositiveInt(data.tableNumber);
    if (!tableNumber) throw httpError(400, "Número de mesa inválido");

    const waiterId = data.waiterId ? toPositiveInt(data.waiterId) : null;
    if (data.waiterId && !waiterId) throw httpError(400, "Empleado encargado inválido");

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw httpError(400, "La orden debe tener al menos un platillo");
    }

    const items = mergeItems(data.items);

    // El precio SIEMPRE se toma de la BD, nunca del cliente (evita manipular el total).
    const products = await orderRepository.getProductsByIds(items.map((i) => i.productId));
    const productsById = new Map(products.map((p) => [p.id, p]));

    const pricedItems = items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw httpError(400, `El producto ${item.productId} no existe`);
      if (!product.is_available) {
        throw httpError(400, `El producto "${product.product_name}" no está disponible`);
      }
      return { ...item, unitPrice: product.price };
    });

    const observations = normalizeObservations(data.observations);

    return await orderRepository.create({ tableNumber, waiterId, observations }, pricedItems);
  },

  async update(id, data) {
    const current = await orderRepository.getById(id);
    if (!current) return undefined;

    const tableNumber = toPositiveInt(data.tableNumber);
    if (!tableNumber) throw httpError(400, "Número de mesa inválido");

    const waiterId = data.waiterId ? toPositiveInt(data.waiterId) : null;
    if (data.waiterId && !waiterId) throw httpError(400, "Empleado encargado inválido");

    const status = String(data.status ?? "").toLowerCase();
    if (!VALID_STATUSES.includes(status)) {
      throw httpError(400, `Estado inválido. Use: ${VALID_STATUSES.join(", ")}`);
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw httpError(400, "La orden debe tener al menos un platillo");
    }

    const items = mergeItems(data.items);

    // Los platillos que ya estaban conservan su precio de venta y su estado de despacho;
    // los nuevos toman el precio actual del menú y deben estar disponibles.
    const previousByProduct = new Map(current.items.map((i) => [i.productId, i]));
    const newIds = items.map((i) => i.productId).filter((pid) => !previousByProduct.has(pid));
    const products = newIds.length ? await orderRepository.getProductsByIds(newIds) : [];
    const productsById = new Map(products.map((p) => [p.id, p]));

    const pricedItems = items.map((item) => {
      const previous = previousByProduct.get(item.productId);
      if (previous) {
        return { ...item, unitPrice: previous.price, dispatched: previous.dispatched };
      }

      const product = productsById.get(item.productId);
      if (!product) throw httpError(400, `El producto ${item.productId} no existe`);
      if (!product.is_available) {
        throw httpError(400, `El producto "${product.product_name}" no está disponible`);
      }
      return { ...item, unitPrice: product.price, dispatched: false };
    });

    return await orderRepository.update(
      id,
      { tableNumber, waiterId, status, observations: normalizeObservations(data.observations) },
      pricedItems
    );
  },

  async remove(id) {
    const order = await orderRepository.getById(id);
    if (!order) return null;

    if (order.status === "pagada") {
      throw httpError(409, "No se puede eliminar una orden que ya está pagada");
    }

    return await orderRepository.remove(id);
  },
};
