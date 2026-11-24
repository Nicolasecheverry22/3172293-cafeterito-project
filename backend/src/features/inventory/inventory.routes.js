import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { idParam } from "../../utils/joi.js";
import {
  inventorySchema, updateInventorySchema, inventoryStatusSchema, inventoryReportQuery, inventoryListQuery,
} from "./inventory.schema.js";

// Montado en app.js bajo /api/inventory con authenticateToken + loadPermissions.
const router = Router();

router.get("/", requirePermission("list_inventory"), validate({ query: inventoryListQuery }), inventoryController.getAll);
router.get("/report-data", requirePermission("report_inventory"), validate({ query: inventoryReportQuery }), inventoryController.getReportData);
router.get("/:id", requirePermission("view_inventory"), validate({ params: idParam }), inventoryController.getById);
router.post("/", requirePermission("create_inventory"), validate({ body: inventorySchema }), inventoryController.create);
router.put("/:id", requirePermission("update_inventory"), validate({ params: idParam, body: updateInventorySchema }), inventoryController.update);
// Sin borrado físico: solo cambio de estado (RFADMIN10)
router.patch("/:id/status", requirePermission("change_status_inventory"), validate({ params: idParam, body: inventoryStatusSchema }), inventoryController.updateStatus);

export default router;
