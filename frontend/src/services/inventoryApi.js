// Llamadas al API del backend para el inventario (suministros).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getInventory() {
  const res = await fetch(`${API_URL}/inventory`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar el inventario`);
  return res.json();
}

export async function getInventoryItem(id) {
  const res = await fetch(`${API_URL}/inventory/${id}`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar el suministro`);
  return res.json();
}

export async function createInventoryItem(payload) {
  const res = await fetch(`${API_URL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al crear el suministro`);
  return data;
}

export async function deleteInventoryItem(id) {
  const res = await fetch(`${API_URL}/inventory/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al eliminar el suministro`);
  return data;
}
