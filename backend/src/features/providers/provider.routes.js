import { Router } from "express";
import { providerController } from "./provider.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { idParam } from "../../utils/joi.js";
import {
  providerSchema, updateProviderSchema, providerStatusSchema, providerReportQuery, providerListQuery,
} from "./provider.schema.js";

// Montado en app.js bajo /api/providers con authenticateToken + loadPermissions.
const router = Router();

router.get("/", requirePermission("list_provider"), validate({ query: providerListQuery }), providerController.getAll);
router.get("/report-data", requirePermission("report_provider"), validate({ query: providerReportQuery }), providerController.getReportData);
router.get("/:id", requirePermission("view_provider"), validate({ params: idParam }), providerController.getById);
router.post("/", requirePermission("create_provider"), validate({ body: providerSchema }), providerController.create);
router.put("/:id", requirePermission("update_provider"), validate({ params: idParam, body: updateProviderSchema }), providerController.update);
// Sin borrado físico: solo habilitar/inhabilitar (RFADMIN17)
router.patch("/:id/status", requirePermission("disable_provider"), validate({ params: idParam, body: providerStatusSchema }), providerController.updateStatus);

export default router;
