// Llamadas al API del backend para órdenes.
import { api } from "./apiClient";

// Estados de una orden (deben coincidir con el backend: order.constants.js)
export const ORDER_STATUSES = ["activa", "lista para entrega", "pagada", "cancelada"];
export const OPEN_ORDER_STATUSES = ["activa", "lista para entrega"];

export const getOrders = (query) => api.get("/orders", { query });

export const getOrderById = (id) => api.get(`/orders/${id}`);

// payload: { tableNumber, waiterId?, observations, items: [{ productId, quantity }] }
// Si no se envía waiterId, el backend asigna al usuario autenticado.
export const createOrder = (payload) => api.post("/orders", payload);

// PUT /api/orders/:id — 409 si la orden está pagada o cancelada, o si se envía "pagada":
// una orden solo se paga generando su comprobante de venta (invoiceApi.createInvoice)
export const updateOrder = (id, payload) => api.put(`/orders/${id}`, payload);

// PATCH /api/orders/:id/cancel — anular (solo órdenes activas o listas para entrega)
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`);
