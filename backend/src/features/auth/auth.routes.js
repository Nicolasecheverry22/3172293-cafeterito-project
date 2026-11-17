// backend/src/features/auth/auth.routes.js
// Rutas de autenticación. Todas públicas excepto /refresh.

import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { loginLimiter, passwordResetLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  loginSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
} from "./auth.schema.js";

const router = Router();

router.post("/login", loginLimiter, validate({ body: loginSchema }), authController.login);

// Renueva el token mientras haya actividad (el frontend lo llama periódicamente)
router.post("/refresh", authenticateToken, authController.refresh);

// Olvidé mi contraseña: correo → código de 6 dígitos → nueva contraseña
router.post("/forgot-password", passwordResetLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post("/verify-reset-token", passwordResetLimiter, validate({ body: verifyResetTokenSchema }), authController.verifyResetToken);
router.post("/reset-password", passwordResetLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;
