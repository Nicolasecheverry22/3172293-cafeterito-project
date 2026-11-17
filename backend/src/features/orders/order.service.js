import { orderRepository } from "./order.repository.js";
import { httpError } from "../../utils/httpError.js";

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

export const orderService = {
  async getAll() {
    return await orderRepository.getAll();
  },

  async getById(id) {
    return await orderRepository.getById(id);
  },

  async getReportData(tableNumber) {
    return await orderRepository.getReportData(tableNumber ?? null);
  },

  async create({ tableNumber, waiterId, observations, items }) {
    const merged = mergeItems(items);
    const products = await orderRepository.getProductsByIds(merged.map((i) => i.productId));
    const productsById = new Map(products.map((p) => [p.id, p]));
    const pricedItems = merged.map((item) => priceNewItem(item, productsById));

    return await orderRepository.create(
      { tableNumber, waiterId: waiterId ?? null, observations: observations ?? null },
      pricedItems
    );
  },

  async update(id, { tableNumber, waiterId, status, observations, items }) {
    const current = await orderRepository.getById(id);
    if (!current) return undefined;

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

    return await orderRepository.update(
      id,
      { tableNumber, waiterId: waiterId ?? null, status, observations: observations ?? null },
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
