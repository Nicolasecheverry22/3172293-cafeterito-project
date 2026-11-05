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

// Permisos asignados a un grupo (GET /api/groups/:groupId/permissions).
export async function getGroupPermissions(groupId) {
  const res = await fetch(`${API_URL}/groups/${groupId}/permissions`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar los permisos del grupo`);
  }
  return res.json();
}

// Reemplaza los permisos de un grupo (PUT /api/groups/:groupId/permissions).
export async function updateGroupPermissions(groupId, permissionIds) {
  const res = await fetch(`${API_URL}/groups/${groupId}/permissions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissionIds }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status} al guardar los permisos del grupo`);
  }
  return data;
}
