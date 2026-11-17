// Llamadas al API del backend para grupos.
import { api } from "./apiClient";

export const getGroups = () => api.get("/groups");

export const getGroupPermissions = (groupId) => api.get(`/groups/${groupId}/permissions`);

export const updateGroupPermissions = (groupId, permissionIds) =>
  api.put(`/groups/${groupId}/permissions`, { permissionIds });
