// Autenticación contra el backend (rutas públicas de /api/auth, salvo /refresh).
import { api, setSession, ApiError } from "@/services/apiClient";

// Correo usado entre las pantallas de recuperación (correo → código → nueva contraseña)
const RESET_EMAIL_KEY = "resetEmail";

export async function login(userData) {
  try {
    const data = await api.post(
      "/auth/login",
      { email: userData.userEmail, password: userData.userPassword },
      { auth: false }
    );
    setSession(data);
    return data;
  } catch (err) {
    // 423: cuenta bloqueada tras 3 intentos fallidos (RNF11)
    if (err instanceof ApiError && err.status === 423) {
      throw new ApiError(
        "Tu cuenta está bloqueada temporalmente por intentos fallidos. Intenta de nuevo en 15 minutos o contacta al administrador.",
        423
      );
    }
    throw err;
  }
}

// Renueva el token (10 min) mientras haya actividad del usuario (RNF09)
export async function refreshSession() {
  const data = await api.post("/auth/refresh");
  setSession(data);
  return data;
}

// ── Recuperación de contraseña ──────────────────────────────────
export async function requestPasswordReset(email) {
  const data = await api.post("/auth/forgot-password", { email }, { auth: false });
  sessionStorage.setItem(RESET_EMAIL_KEY, email.trim().toLowerCase());
  return data;
}

export const getResetEmail = () => sessionStorage.getItem(RESET_EMAIL_KEY);

export function verifyResetToken(token) {
  return api.post("/auth/verify-reset-token", { email: getResetEmail(), token }, { auth: false });
}

export async function resetPassword(token, password) {
  const data = await api.post(
    "/auth/reset-password",
    { email: getResetEmail(), token, password },
    { auth: false }
  );
  sessionStorage.removeItem(RESET_EMAIL_KEY);
  return data;
}
