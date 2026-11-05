// Llamadas al API del backend para proveedores.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getProviders() {
  const res = await fetch(`${API_URL}/providers`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar proveedores`);
  return res.json();
}

export async function getProviderById(id) {
  const res = await fetch(`${API_URL}/providers/${id}`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar el proveedor`);
  return res.json();
}

export async function createProvider(payload) {
  const res = await fetch(`${API_URL}/providers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al crear el proveedor`);
  return data;
}

export async function deleteProvider(id) {
  const res = await fetch(`${API_URL}/providers/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al eliminar el proveedor`);
  return data;
}
