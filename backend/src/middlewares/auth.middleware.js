

// backend/src/middlewares/auth.middleware.js
// Middleware de autenticación: verifica la identidad mediante el JWT

import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Deja disponible el usuario autenticado para los siguientes handlers
    // req.user.id  /  req.user.email
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};
