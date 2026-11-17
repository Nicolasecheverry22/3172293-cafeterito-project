import { Router } from "express";
import { userController } from "./user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParam } from "../../utils/joi.js";
import { createUserSchema, updateUserSchema, userStatusSchema, userReportQuery, userListQuery } from "./user.schema.js";

// Montado en app.js bajo /api/users con authenticateToken.
const router = Router();

router.get("/", validate({ query: userListQuery }), userController.getAll);

// RUTA DE REPORTE (debe ir antes de /:id para evitar conflictos)
router.get("/report-data", validate({ query: userReportQuery }), userController.getReportData);

// Permisos individuales del usuario
router.get("/:id/permissions", validate({ params: idParam }), userController.getPermissions);
router.put("/:id/permissions", validate({ params: idParam }), userController.updatePermissions);

router.get("/:id", validate({ params: idParam }), userController.getById);
router.post("/", validate({ body: createUserSchema }), userController.create);
router.put("/:id", validate({ params: idParam, body: updateUserSchema }), userController.update);
// Sin borrado físico: solo cambio de estado (RFADMIN05)
router.patch("/:id/status", validate({ params: idParam, body: userStatusSchema }), userController.updateStatus);

export default router;
