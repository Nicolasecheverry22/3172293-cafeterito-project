// Llamadas al API del backend para el recurso de usuarios.
// La URL base se puede configurar con VITE_API_URL en un .env del frontend;
// si no existe, usa el backend local por defecto (http://localhost:4000/api).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Lista los usuarios registrados en la base de datos.
export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar usuarios`);
  }
  return res.json();
}

// Obtiene un usuario por su id.
export async function getUserById(id) {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar el usuario`);
  }
  return res.json();
}

// Crea un usuario en la base de datos (POST /api/users).
export async function createUser(payload) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status} al crear el usuario`);
  }
  return data;
}

// Permisos del usuario: directos + heredados de grupos (GET /api/users/:id/permissions).
export async function getUserPermissions(id) {
  const res = await fetch(`${API_URL}/users/${id}/permissions`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar los permisos del usuario`);
  }
  return res.json();
}

// Reemplaza los permisos directos del usuario (PUT /api/users/:id/permissions).
export async function updateUserPermissions(id, permissionIds) {
  const res = await fetch(`${API_URL}/users/${id}/permissions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissionIds }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status} al guardar los permisos del usuario`);
  }
  return data;
}

// Elimina un usuario por su id (DELETE /api/users/:id).
export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status} al eliminar el usuario`);
  }
  return data;
}

// Actualiza el usuario en la base de datos (PUT /api/users/:id).
export async function updateUser(id, payload) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al actualizar el usuario`);
  return data;
}
