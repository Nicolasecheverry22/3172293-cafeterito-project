// Llamadas al API del backend para productos del menú (platillos).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar productos`);
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar el producto`);
  return res.json();
}

export async function createProduct(payload) {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al crear el producto`);
  return data;
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al eliminar el producto`);
  return data;
}

// Actualiza el producto en la base de datos (PUT /api/products/:id).
export async function updateProduct(id, payload) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status} al actualizar el producto`);
  return data;
}
