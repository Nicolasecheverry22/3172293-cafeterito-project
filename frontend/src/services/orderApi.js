// Llamadas al API del backend para órdenes.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getOrders() {
  const res = await fetch(`${API_URL}/orders`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar órdenes`);
  return res.json();
}

export async function getOrderById(id) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar la orden`);
  return res.json();
}

// payload: { tableNumber, waiterId, observations, items: [{ productId, quantity }] }
export async function createOrder(payload) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al crear la orden`);
  return data;
}

export async function deleteOrder(id) {
  const res = await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al eliminar la orden`);
  return data;
}

// Actualiza la orden en la base de datos (PUT /api/orders/:id).
export async function updateOrder(id, payload) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al actualizar la orden`);
  return data;
}
