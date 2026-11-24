// backend/src/features/access/access.routes.js
// Montado en app.js bajo /api/access con authenticateToken + loadPermissions.
// Solo autenticación: cada usuario consulta sus propios permisos.

import { Router } from "express";
import { accessController } from "./access.controller.js";

const router = Router();

router.get("/check/:permissionCode", accessController.testPermission);

export default router;
