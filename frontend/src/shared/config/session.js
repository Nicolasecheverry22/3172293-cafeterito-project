// Configuración del cierre de sesión por inactividad (RNF09). Único lugar con estos valores.
// Se pueden sobreescribir en frontend/.env (ver .env.example):
//   VITE_SESSION_IDLE_MINUTES     minutos sin actividad antes de cerrar la sesión (15)
//   VITE_SESSION_WARNING_SECONDS  segundos que dura la alerta "¿Sigues ahí?" antes del cierre (60)
//
// REGLA: el JWT del backend (JWT_EXPIRES) debe durar MÁS que la ventana de inactividad
// más un margen (p. ej. 15 min + 5 = "20m"). El token solo se renueva cuando hay actividad;
// si venciera antes del cierre por inactividad, "Seguir conectado" fallaría con 401.

const positiveNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const idleMinutes = positiveNumber(import.meta.env.VITE_SESSION_IDLE_MINUTES, 15);
const warningSeconds = positiveNumber(import.meta.env.VITE_SESSION_WARNING_SECONDS, 60);

export const SESSION_IDLE_MS = idleMinutes * 60 * 1000;
// La advertencia nunca puede durar más que la ventana de inactividad completa
export const SESSION_WARNING_MS = Math.min(warningSeconds * 1000, SESSION_IDLE_MS);
// Como máximo una renovación del token por minuto aunque haya mucha actividad
export const SESSION_REFRESH_THROTTLE_MS = 60 * 1000;
// Frecuencia con la que se compara Date.now() con la última actividad
export const SESSION_CHECK_INTERVAL_MS = 1000;
