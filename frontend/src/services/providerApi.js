// Llamadas al API del backend para proveedores.
import { api } from "./apiClient";

export const getProviders = (query) => api.get("/providers", { query });

export const getProviderById = (id) => api.get(`/providers/${id}`);

export const createProvider = (payload) => api.post("/providers", payload);

export const updateProvider = (id, payload) => api.put(`/providers/${id}`, payload);

// PATCH /api/providers/:id/status — habilitar/inhabilitar (no existe borrado físico)
export const setProviderStatus = (id, isActive) =>
  api.patch(`/providers/${id}/status`, { isActive });
