// Llamadas al API del backend para el catálogo de permisos.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Lista todos los permisos con su módulo (GET /api/permissions).
export async function getPermissions() {
  const res = await fetch(`${API_URL}/permissions`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar permisos`);
  }
  return res.json();
}
