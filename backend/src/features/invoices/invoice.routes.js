import { Router } from "express";
import { invoiceController } from "./invoice.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { idParam } from "../../utils/joi.js";
import {
  createInvoiceSchema, voidInvoiceSchema, orderIdParam, invoiceListQuery, invoiceReportQuery,
} from "./invoice.schema.js";

// Montado en app.js bajo /api/invoices con authenticateToken + loadPermissions.
// Sin PUT ni DELETE: un comprobante nunca se edita ni se borra, solo se anula.
const router = Router();

router.get("/", requirePermission("list_invoice"), validate({ query: invoiceListQuery }), invoiceController.getAll);
router.get("/settings", requirePermission("create_invoice"), invoiceController.getSettings);
router.get("/report-data", requirePermission("report_invoice"), validate({ query: invoiceReportQuery }), invoiceController.getReportData);
router.get("/by-order/:orderId", requirePermission("view_invoice"), validate({ params: orderIdParam }), invoiceController.getByOrderId);
router.get("/:id", requirePermission("view_invoice"), validate({ params: idParam }), invoiceController.getById);
router.post("/", requirePermission("create_invoice"), validate({ body: createInvoiceSchema }), invoiceController.create);
router.patch("/:id/void", requirePermission("void_invoice"), validate({ params: idParam, body: voidInvoiceSchema }), invoiceController.void);

export default router;
