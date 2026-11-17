// Llamadas al API del backend para el catálogo de permisos.
import { api } from "./apiClient";

// Lista todos los permisos con su módulo (GET /api/permissions).
export const getPermissions = () => api.get("/permissions");
