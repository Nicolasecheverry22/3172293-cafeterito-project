// Límites de peticiones para rutas sensibles (fuerza bruta / abuso de correo).
// Configurables por .env; valores por defecto pensados para un POS con pocos usuarios.
import { rateLimit } from "express-rate-limit";

const minutes = (value, fallback) => (Number(value) || fallback) * 60 * 1000;

const limiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: message },
  });

// Login: complementa el bloqueo por cuenta (RNF11) limitando por IP.
export const loginLimiter = limiter({
  windowMs: minutes(process.env.RATE_LIMIT_WINDOW_MINUTES, 15),
  limit: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 20,
  message: "Demasiados intentos de inicio de sesión. Intente de nuevo más tarde.",
});

// Recuperación de contraseña: evita envío masivo de correos y adivinar códigos.
export const passwordResetLimiter = limiter({
  windowMs: minutes(process.env.RATE_LIMIT_WINDOW_MINUTES, 15),
  limit: Number(process.env.RATE_LIMIT_RESET_MAX) || 5,
  message: "Demasiadas solicitudes de recuperación. Intente de nuevo más tarde.",
});
