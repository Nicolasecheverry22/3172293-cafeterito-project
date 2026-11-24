// backend/src/features/groups/groups.routes.js
// Montado en app.js bajo /api/groups con authenticateToken + loadPermissions.

import { Router } from "express";
import { groupsController } from "./groups.controller.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { MANAGE_PERMISSIONS } from "../access/access.service.js";

const router = Router();

// El listado de grupos también lo necesitan los formularios de usuario para elegir el rol;
// asignar o cambiar roles sigue protegido en user.service.
router.get("/", requirePermission([MANAGE_PERMISSIONS, "create_user", "update_user"]), groupsController.getAll);
router.get("/:groupId/permissions", requirePermission(MANAGE_PERMISSIONS), groupsController.getPermissionsByGroupId);
router.put("/:groupId/permissions", requirePermission(MANAGE_PERMISSIONS), groupsController.updatePermissions);

export default router;
