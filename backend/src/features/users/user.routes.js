import { Router } from "express";

import { userController } from "./user.controller.js";

const router = Router();

// Listar usuarios (lectura pública)
router.get("/", userController.getAll);

// Obtener un usuario por id (para la vista de detalle)
router.get("/:id", userController.getById);

// Crear usuario (registro público desde el formulario del frontend)
router.post("/", userController.create);

// Eliminar usuario por id
router.delete("/:id", userController.remove);

export default router;
