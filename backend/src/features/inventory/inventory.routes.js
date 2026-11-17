import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParam } from "../../utils/joi.js";
import { inventorySchema, inventoryStatusSchema, inventoryReportQuery } from "./inventory.schema.js";

// Montado en app.js bajo /api/inventory con authenticateToken.
const router = Router();

router.get("/", inventoryController.getAll);
router.get("/report-data", validate({ query: inventoryReportQuery }), inventoryController.getReportData);
router.get("/:id", validate({ params: idParam }), inventoryController.getById);
router.post("/", validate({ body: inventorySchema }), inventoryController.create);
router.put("/:id", validate({ params: idParam, body: inventorySchema }), inventoryController.update);
// Sin borrado físico: solo cambio de estado (RFADMIN10)
router.patch("/:id/status", validate({ params: idParam, body: inventoryStatusSchema }), inventoryController.updateStatus);

export default router;
