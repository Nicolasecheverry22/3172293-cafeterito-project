import { Router } from "express";
import { invoiceController } from "./invoice.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { idParam } from "../../utils/joi.js";
import {
  createInvoiceSchema, voidInvoiceSchema, orderIdParam, invoiceListQuery, invoiceReportQuery,
} from "./invoice.schema.js";

// Montado en app.js bajo /api/invoices con authenticateToken.
// Sin PUT ni DELETE: un comprobante nunca se edita ni se borra, solo se anula.
const router = Router();

router.get("/", validate({ query: invoiceListQuery }), invoiceController.getAll);
router.get("/settings", invoiceController.getSettings);
router.get("/report-data", validate({ query: invoiceReportQuery }), invoiceController.getReportData);
router.get("/by-order/:orderId", validate({ params: orderIdParam }), invoiceController.getByOrderId);
router.get("/:id", validate({ params: idParam }), invoiceController.getById);
router.post("/", validate({ body: createInvoiceSchema }), invoiceController.create);
router.patch("/:id/void", validate({ params: idParam, body: voidInvoiceSchema }), invoiceController.void);

export default router;
