// Llamadas al API del backend para productos del menú (platillos).
import { api } from "./apiClient";

export const getProducts = (query) => api.get("/products", { query });

export const getProductById = (id) => api.get(`/products/${id}`);

export const createProduct = (payload) => api.post("/products", payload);

export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload);

// PATCH /api/products/:id/status — habilitar/inhabilitar (no existe borrado físico).
// 409 si el platillo está en una orden abierta.
export const setProductStatus = (id, isAvailable) =>
  api.patch(`/products/${id}/status`, { isAvailable });

// Público (Home): no envía token
export const getTopSellingProducts = () => api.get("/products/top-selling", { auth: false });
