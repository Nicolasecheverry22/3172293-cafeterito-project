// Llamadas al API del backend para el recurso de usuarios.
import { api } from "./apiClient";

export const getUsers = (query) => api.get("/users", { query });

export const getUserById = (id) => api.get(`/users/${id}`);

// POST /api/users — el backend ignora isSuperuser/isStaff/isActive (los calcula él)
export const createUser = (payload) => api.post("/users", payload);

// PUT /api/users/:id
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload);

// PATCH /api/users/:id/status — habilitar/deshabilitar (no existe borrado físico)
export const setUserStatus = (id, isActive) => api.patch(`/users/${id}/status`, { isActive });

// Permisos del usuario: directos + heredados de grupos
export const getUserPermissions = (id) => api.get(`/users/${id}/permissions`);

// Reemplaza los permisos directos del usuario
export const updateUserPermissions = (id, permissionIds) =>
  api.put(`/users/${id}/permissions`, { permissionIds });

// ── Mi perfil (solo autenticación) ──────────────────────────────
// GET /api/users/me → datos propios + roles (groups) + isSuperuser/permissions
export const getMe = () => api.get("/users/me");

// PUT /api/users/me — solo nombre, teléfono, dirección, correo personal y foto.
// Correo de acceso, documento, rol y estado → 400 (solo un administrador los cambia).
export const updateMe = (payload) => api.put("/users/me", payload);

// PUT /api/users/me/password { currentPassword, newPassword }
export const changeMyPassword = (payload) => api.put("/users/me/password", payload);
