// Llamadas al API del backend para autenticación.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Inicia sesión contra el backend (POST /api/auth/login).
// Devuelve { message, token, user } o lanza un error con el mensaje del backend.
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Usuario o contraseña incorrectos.");
  }
  return data;
}

// Cierra sesión: elimina el token guardado.
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Token JWT guardado (para peticiones autenticadas futuras).
export function getToken() {
  return localStorage.getItem("token");
}
