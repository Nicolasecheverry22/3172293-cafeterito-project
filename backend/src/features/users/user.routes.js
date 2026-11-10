import { Router } from "express";
import { userController } from "./user.controller.js";

const router = Router();

// Listar usuarios
router.get("/", userController.getAll);

// RUTA DE REPORTE (Debe ir antes de /:id para evitar conflictos)
router.get("/report-data", userController.getReportData);

// Permisos individuales del usuario
router.get("/:id/permissions", userController.getPermissions);
router.put("/:id/permissions", userController.updatePermissions);

// Obtener un usuario por id (Ruta dinámica)
router.get("/:id", userController.getById);

// Crear, actualizar y eliminar
router.post("/", userController.create);
router.put("/:id", userController.update);
router.delete("/:id", userController.remove);

export default router;