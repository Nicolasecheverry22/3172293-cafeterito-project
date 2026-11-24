// backend/src/features/permissions/permissions.routes.js
// Montado en app.js bajo /api/permissions con authenticateToken + loadPermissions.

import { Router } from "express";
import { permissionsController } from "./permissions.controller.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { MANAGE_PERMISSIONS } from "../access/access.service.js";

const router = Router();

router.get("/", requirePermission(MANAGE_PERMISSIONS), permissionsController.getAll);

export default router;
