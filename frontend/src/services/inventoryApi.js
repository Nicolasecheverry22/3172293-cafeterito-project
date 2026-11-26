// Llamadas al API del backend para el inventario (suministros).
import { api } from "./apiClient";

// Estados permitidos (deben coincidir con el backend: inventory.schema.js)
export const INVENTORY_STATUSES = ["Disponible", "Vencido", "Avería", "Agotado"];

// Confirmación al cambiar el estado de un insumo. La comparten InventoryRowActions y
// EditProvisions para que el criterio no se desincronice: pasar a Vencido / Avería /
// Agotado saca el insumo de circulación → "danger"; volver a Disponible → "info".
export const inventoryStatusConfirmOptions = ({ name, from, to }) => {
  const isDanger = to !== "Disponible";
  const label = name ? `"${name}"` : "el suministro";
  return {
    title: `¿Marcar ${label} como ${to}?`,
    text: isDanger
      ? `El suministro pasará de "${from}" a "${to}" y dejará de contarse como disponible.`
      : `El suministro pasará de "${from}" a "Disponible" y volverá a contarse en el inventario.`,
    confirmButtonText: `Sí, marcar como ${to}`,
    variant: isDanger ? "danger" : "info",
  };
};

export const getInventory = (query) => api.get("/inventory", { query });

export const getInventoryItem = (id) => api.get(`/inventory/${id}`);

export const createInventoryItem = (payload) => api.post("/inventory", payload);

export const updateInventoryItem = (id, payload) => api.put(`/inventory/${id}`, payload);

// PATCH /api/inventory/:id/status — cambio de estado (no existe borrado físico)
export const setInventoryStatus = (id, status) => api.patch(`/inventory/${id}/status`, { status });
