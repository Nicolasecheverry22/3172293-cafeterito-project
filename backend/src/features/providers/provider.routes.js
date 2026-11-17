import { Router } from "express";
import { providerController } from "./provider.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParam } from "../../utils/joi.js";
import { providerSchema, providerStatusSchema, providerReportQuery, providerListQuery } from "./provider.schema.js";

// Montado en app.js bajo /api/providers con authenticateToken.
const router = Router();

router.get("/", validate({ query: providerListQuery }), providerController.getAll);
router.get("/report-data", validate({ query: providerReportQuery }), providerController.getReportData);
router.get("/:id", validate({ params: idParam }), providerController.getById);
router.post("/", validate({ body: providerSchema }), providerController.create);
router.put("/:id", validate({ params: idParam, body: providerSchema }), providerController.update);
// Sin borrado físico: solo habilitar/inhabilitar (RFADMIN17)
router.patch("/:id/status", validate({ params: idParam, body: providerStatusSchema }), providerController.updateStatus);

export default router;
