import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getToken } from "@/services/apiClient";
import { refreshSession } from "../services/authService";

// RNF09: la sesión se cierra tras 10 minutos sin actividad.
// Mientras haya actividad, el token (que dura 10 min) se renueva con /api/auth/refresh.
const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
// Como máximo una renovación por minuto aunque haya mucha actividad
const REFRESH_THROTTLE_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export default function SessionTimeout({ onTimeout }) {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  // Momento de la última renovación (se inicializa al montar; el login acaba de emitir el token)
  const lastRefreshRef = useRef(0);
  const refreshingRef = useRef(false);

  const handleLogout = useCallback(() => {
    onTimeout?.();
    clearSession();
    navigate("/auth", { state: { reason: "session-expired" } });
  }, [navigate, onTimeout]);

  const maybeRefresh = useCallback(async () => {
    if (refreshingRef.current || !getToken()) return;
    if (Date.now() - lastRefreshRef.current < REFRESH_THROTTLE_MS) return;

    refreshingRef.current = true;
    try {
      await refreshSession();
      lastRefreshRef.current = Date.now();
    } catch {
      // Un 401 ya limpia la sesión y redirige (apiClient); otros errores se reintentan
      // en la próxima actividad.
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  const handleActivity = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT_MS);
    maybeRefresh();
  }, [handleLogout, maybeRefresh]);

  useEffect(() => {
    lastRefreshRef.current = Date.now();
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT_MS);

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [handleActivity, handleLogout]);

  return null;
}
