// Llamadas al API del backend para el inventario (suministros).
import { api } from "./apiClient";

// Estados permitidos (deben coincidir con el backend: inventory.schema.js)
export const INVENTORY_STATUSES = ["Disponible", "Vencido", "Avería", "Agotado"];

export const getInventory = (query) => api.get("/inventory", { query });

export const getInventoryItem = (id) => api.get(`/inventory/${id}`);

export const createInventoryItem = (payload) => api.post("/inventory", payload);

export const updateInventoryItem = (id, payload) => api.put(`/inventory/${id}`, payload);

// PATCH /api/inventory/:id/status — cambio de estado (no existe borrado físico)
export const setInventoryStatus = (id, status) => api.patch(`/inventory/${id}/status`, { status });
