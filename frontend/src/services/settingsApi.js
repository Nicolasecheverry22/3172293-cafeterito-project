// Configuración del restaurante (una sola fila en la BD).
import { api } from "./apiClient";

// GET /api/settings → { tableCount, updatedAt, updatedBy }
export const getSettings = () => api.get("/settings");

// PUT /api/settings — requiere permiso change_settings.
// 409 si se reduce el total y una mesa que desaparecería tiene una orden abierta.
export const updateSettings = (payload) => api.put("/settings", payload);
