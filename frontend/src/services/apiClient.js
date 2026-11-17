// Cliente HTTP único para el backend.
// - Base URL desde VITE_API_URL (ver frontend/.env.example).
// - Agrega "Authorization: Bearer <token>" en cada petición autenticada.
// - Ante un 401 en una ruta autenticada: limpia la sesión y redirige al login.
// - Lanza ApiError con el mensaje del backend ({ error }) y su código HTTP.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// ── Sesión (sessionStorage: se borra al cerrar la pestaña) ──────
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export function setSession({ token, user }) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  // Restos de versiones anteriores que guardaban en localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function redirectToLogin() {
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.replace("/auth?reason=session-expired");
  }
}

const buildUrl = (path, query) => {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  return url;
};

/**
 * @param {string} path   Ruta relativa a la API, p. ej. "/users/3"
 * @param {object} opts   { method, body, query, auth = true }
 */
export async function apiRequest(path, { method = "GET", body, query, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Verifica tu conexión.", 0);
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && auth) {
    clearSession();
    redirectToLogin();
    throw new ApiError(data.error || "Tu sesión expiró. Inicia sesión de nuevo.", 401);
  }

  if (!res.ok) {
    throw new ApiError(data.error || `Error ${res.status} en la solicitud`, res.status, data.details);
  }

  return data;
}

export const api = {
  get: (path, opts) => apiRequest(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => apiRequest(path, { ...opts, method: "PATCH", body }),
};
