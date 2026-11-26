import { useEffect } from "react";
import { endSession, getToken, LOGOUT_REASONS } from "@/services/apiClient";
import {
  showSessionWarningAlert,
  updateSessionWarningCountdown,
  SESSION_WARNING_RESULT,
} from "@/shared/services/alertService";
import {
  SESSION_IDLE_MS,
  SESSION_WARNING_MS,
  SESSION_REFRESH_THROTTLE_MS,
  SESSION_CHECK_INTERVAL_MS,
} from "@/shared/config/session";
import { refreshSession } from "../services/authService";

// RNF09: cierre de sesión tras SESSION_IDLE_MS sin actividad REAL del usuario.
//  - Solo cuentan los eventos del usuario (ACTIVITY_EVENTS); las peticiones automáticas
//    (polling del tablero, etc.) no pasan por aquí y no mantienen viva la sesión.
//  - Un intervalo de 1 s compara Date.now() con la última actividad, en lugar de un
//    setTimeout largo: sigue siendo correcto aunque el navegador ralentice los timers de
//    pestañas en segundo plano o el equipo se suspenda (al volver, cierra de inmediato).
//  - En los últimos SESSION_WARNING_MS se muestra "¿Sigues ahí?" con cuenta regresiva.
//  - Mientras haya actividad, el token se renueva (/api/auth/refresh) como máximo 1 vez/min.
// Debe montarse UNA sola vez por encima de todos los layouts autenticados (IdleSessionGuard).

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"];
const MOUSEMOVE_THROTTLE_MS = 1000;

// Momento de emisión del token actual (claim iat), para no renovar uno recién emitido.
function tokenIssuedAt() {
  try {
    const payload = JSON.parse(atob(getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.iat * 1000;
  } catch {
    return 0;
  }
}

export default function useIdleSession() {
  useEffect(() => {
    let lastActivityAt = Date.now();
    let lastMouseMoveAt = 0;
    let lastRefreshAt = tokenIssuedAt();
    let refreshing = false;
    let warningOpen = false;
    let ended = false;

    const idleFor = () => Date.now() - lastActivityAt;
    const secondsLeft = () => Math.max(0, Math.ceil((SESSION_IDLE_MS - idleFor()) / 1000));

    const expire = () => {
      if (ended) return;
      ended = true;
      endSession(LOGOUT_REASONS.INACTIVITY);
    };

    const refresh = async ({ force = false } = {}) => {
      // Nunca dos renovaciones a la vez: la que está en curso ya renueva el token
      if (refreshing || ended || !getToken()) return;
      if (!force && Date.now() - lastRefreshAt < SESSION_REFRESH_THROTTLE_MS) return;
      refreshing = true;
      try {
        await refreshSession();
        lastRefreshAt = Date.now();
      } catch {
        // Un 401 ya cierra la sesión (apiClient); otros errores se reintentan en la
        // próxima actividad.
      } finally {
        refreshing = false;
      }
    };

    const openWarning = () => {
      warningOpen = true;
      // Swal.fire reemplaza (y cierra) cualquier otra alerta abierta
      showSessionWarningAlert({ seconds: secondsLeft(), timer: SESSION_IDLE_MS - idleFor() }).then(
        (result) => {
          warningOpen = false;
          if (ended) return;
          if (SESSION_WARNING_RESULT.stayConnected(result)) {
            lastActivityAt = Date.now();
            refresh({ force: true });
          } else if (SESSION_WARNING_RESULT.logout(result)) {
            expire();
          }
          // Si otra alerta la reemplazó, el siguiente tick la vuelve a abrir.
        }
      );
    };

    const tick = () => {
      if (ended || !getToken()) return;
      const idle = idleFor();
      if (idle >= SESSION_IDLE_MS) {
        expire();
      } else if (idle >= SESSION_IDLE_MS - SESSION_WARNING_MS) {
        if (warningOpen) updateSessionWarningCountdown(secondsLeft());
        else openWarning();
      }
    };

    const onActivity = (event) => {
      if (ended) return;
      // Con la alerta abierta hay que elegir una opción: la actividad no la cierra
      if (warningOpen) return;
      if (event?.type === "mousemove") {
        const now = Date.now();
        if (now - lastMouseMoveAt < MOUSEMOVE_THROTTLE_MS) return;
        lastMouseMoveAt = now;
      }
      // Si ya se superó el límite (pestaña dormida, equipo suspendido), la actividad
      // que llega al volver no revive la sesión.
      if (idleFor() >= SESSION_IDLE_MS) {
        expire();
        return;
      }
      lastActivityAt = Date.now();
      refresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      tick(); // primero comprueba si el tiempo ya se agotó mientras estaba oculta
      onActivity();
    };

    const intervalId = setInterval(tick, SESSION_CHECK_INTERVAL_MS);
    ACTIVITY_EVENTS.forEach((type) =>
      window.addEventListener(type, onActivity, { passive: true, capture: true })
    );
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((type) =>
        window.removeEventListener(type, onActivity, { capture: true })
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}
