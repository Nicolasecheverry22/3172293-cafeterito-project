import { Router } from "express";
import { userController } from "./user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { MANAGE_PERMISSIONS } from "../access/access.service.js";
import { idParam } from "../../utils/joi.js";
import { createUserSchema, updateUserSchema, userStatusSchema, userReportQuery, userListQuery } from "./user.schema.js";

// Montado en app.js bajo /api/users con authenticateToken + loadPermissions.
const router = Router();

router.get("/", requirePermission("list_user"), validate({ query: userListQuery }), userController.getAll);

// RUTA DE REPORTE (debe ir antes de /:id para evitar conflictos)
router.get("/report-data", requirePermission("report_user"), validate({ query: userReportQuery }), userController.getReportData);

// Permisos individuales del usuario
router.get("/:id/permissions", requirePermission(MANAGE_PERMISSIONS), validate({ params: idParam }), userController.getPermissions);
router.put("/:id/permissions", requirePermission(MANAGE_PERMISSIONS), validate({ params: idParam }), userController.updatePermissions);

router.get("/:id", requirePermission("view_user"), validate({ params: idParam }), userController.getById);
router.post("/", requirePermission("create_user"), validate({ body: createUserSchema }), userController.create);
router.put("/:id", requirePermission("update_user"), validate({ params: idParam, body: updateUserSchema }), userController.update);
// Sin borrado físico: solo cambio de estado (RFADMIN05)
router.patch("/:id/status", requirePermission("disable_user"), validate({ params: idParam, body: userStatusSchema }), userController.updateStatus);

export default router;
