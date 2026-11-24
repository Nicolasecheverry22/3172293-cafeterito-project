import { Router } from "express";
import { orderController } from "./order.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { idParam } from "../../utils/joi.js";
import { createOrderSchema, updateOrderSchema, orderReportQuery, orderListQuery } from "./order.schema.js";

// Montado en app.js bajo /api/orders con authenticateToken + loadPermissions.
// PUT acepta update_order o prepare_order: con solo prepare_order el service únicamente
// permite cambiar el estado entre "activa" y "lista para entrega".
const router = Router();

router.get("/", requirePermission("list_order"), validate({ query: orderListQuery }), orderController.getAll);
router.get("/report-data", requirePermission("report_order"), validate({ query: orderReportQuery }), orderController.getReportData);
router.get("/:id", requirePermission("view_order"), validate({ params: idParam }), orderController.getById);
router.post("/", requirePermission("create_order"), validate({ body: createOrderSchema }), orderController.create);
router.put("/:id", requirePermission(["update_order", "prepare_order"]), validate({ params: idParam, body: updateOrderSchema }), orderController.update);
// Sin borrado físico: anular = estado "cancelada" (RFADMIN29)
router.patch("/:id/cancel", requirePermission("cancel_order"), validate({ params: idParam }), orderController.cancel);

export default router;
