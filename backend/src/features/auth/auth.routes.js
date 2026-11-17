// backend/src/features/auth/auth.routes.js
// Rutas de autenticación (públicas)

import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema } from "./auth.schema.js";

const router = Router();

// POST /api/auth/login
router.post("/login", validate({ body: loginSchema }), authController.login);

export default router;
