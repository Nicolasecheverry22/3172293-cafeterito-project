import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";

// Montado en app.js bajo /api/dashboard con authenticateToken + loadPermissions.
// Sin requirePermission global: cualquier usuario autenticado lo abre y el service
// arma la respuesta solo con las secciones que sus permisos permiten.
const router = Router();

router.get("/", dashboardController.get);

export default router;
