// backend/src/middlewares/auth.middleware.js
// Middleware de autenticación: verifica la identidad mediante el JWT
// enviado en la cabecera "Authorization: Bearer <token>".

import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato de token inválido (use Bearer)" });
  }

  try {
    // Deja disponible el usuario autenticado: req.user.id / req.user.email
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
