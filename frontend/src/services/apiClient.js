// Cliente HTTP único para el backend.
// - Base URL desde VITE_API_URL (ver frontend/.env.example).
// - Agrega "Authorization: Bearer <token>" en cada petición autenticada.
// - Ante un 401 en una ruta autenticada: limpia la sesión y redirige al login.
// - Ante un 403 (sin permiso): alerta con el mensaje del servidor, sin cerrar la sesión.
// - Lanza ApiError con el mensaje del backend ({ error }) y su código HTTP.

import { showForbiddenAlert } from "@/shared/services/alertService";

export const API_URL =import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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

// Evento para que el navbar refresque el avatar cuando cambia el usuario en sesión
export const SESSION_EVENT = "session-user-change";

export function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY)) ?? null;
  } catch {
    return null;
  }
}

export function setSession({ token, user }) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

// ¿El usuario en sesión tiene alguno de los permisos? (login/refresh guardan isSuperuser y
// permissions). Es SOLO para la interfaz: el backend vuelve a verificar cada petición.
// Para componentes React usar el hook usePermission (se actualiza con SESSION_EVENT).
export function sessionCan(codes) {
  const user = getSessionUser();
  if (user?.isSuperuser) return true;
  const granted = user?.permissions ?? [];
  return [].concat(codes).some((code) => granted.includes(code));
}

// Módulos principales en orden de navegación (Navbar y redirección tras el login).
// El Navbar les agrega el icono.
export const MODULE_ROUTES = [
  { to: "/userList", label: "Usuarios", permission: "list_user" },
  { to: "/inventoryList", label: "Inventario", permission: "list_inventory" },
  { to: "/providerList", label: "Proveedores", permission: "list_provider" },
  { to: "/menuList", label: "Menú", permission: "list_product" },
  { to: "/ordensList", label: "Órdenes", permission: "list_order" },
  { to: "/invoiceList", label: "Comprobantes", permission: "list_invoice" },
];

// Primer módulo permitido para el usuario en sesión, o /home si no tiene ninguno
export const firstAllowedPath = () =>
  MODULE_ROUTES.find((module) => sessionCan(module.permission))?.to ?? "/home";

// Actualiza datos visibles del usuario en sesión (p. ej. tras editar su propia foto)
export function updateSessionUser(patch) {
  const current = getSessionUser();
  if (current) setSession({ user: { ...current, ...patch } });
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

  // 403: falta un permiso. Alerta amigable con el mensaje del servidor; la sesión sigue abierta.
  // Las alertas de error que el llamador muestre después no la reemplazan (alertService).
  if (res.status === 403) {
    const message = data.error || "No tienes permiso para realizar esta acción";
    showForbiddenAlert(message);
    throw new ApiError(message, 403, data.details);
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
