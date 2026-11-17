// backend/src/middlewares/auth.middleware.js
// Middleware de autenticación: verifica el JWT ("Authorization: Bearer <token>") y que
// el usuario siga activo y sin bloqueo (un token emitido antes de deshabilitar o
// bloquear al usuario deja de servir de inmediato).

import jwt from "jsonwebtoken";
import { authRepository } from "../features/auth/auth.repository.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato de token inválido (use Bearer)" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  // Errores de BD aquí se propagan al middleware global (500)
  const user = await authRepository.findSessionUser(payload.id);
  if (!user || !user.is_active) {
    return res.status(401).json({ error: "Usuario inactivo" });
  }
  if (user.is_locked) {
    return res.status(401).json({ error: "Cuenta bloqueada temporalmente" });
  }

  // Deja disponible el usuario autenticado: req.user.id / req.user.email
  req.user = { id: payload.id, email: payload.email };
  next();
};
