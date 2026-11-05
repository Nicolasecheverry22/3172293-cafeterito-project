// Llamadas al API del backend para grupos.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Lista los grupos registrados (GET /api/groups).
export async function getGroups() {
  const res = await fetch(`${API_URL}/groups`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar grupos`);
  }
  return res.json();
}
