import { invoiceService } from "./invoice.service.js";
import { withConstraintErrors } from "../../utils/constraintErrors.js";

// Mensajes según err.constraint; cualquier otro error sigue al middleware global.
const withInvoiceErrors = withConstraintErrors({
  uq_invoices_order: [409, "La orden ya fue pagada o cancelada"],
  chk_invoices_cash: [400, "El valor recibido es menor que el total a pagar"],
});

const NOT_FOUND = { error: "Comprobante de venta no encontrado" };

export const invoiceController = {
  getSettings: (req, res) => {
    res.json(invoiceService.getSettings());
  },

  getAll: withInvoiceErrors(async (req, res) => {
    res.json(await invoiceService.list(req.query));
  }),

  getReportData: withInvoiceErrors(async (req, res) => {
    res.json(await invoiceService.getReportData(req.query));
  }),

  getById: withInvoiceErrors(async (req, res) => {
    const invoice = await invoiceService.getById(Number(req.params.id));
    if (!invoice) return res.status(404).json(NOT_FOUND);
    res.json(invoice);
  }),

  getByOrderId: withInvoiceErrors(async (req, res) => {
    const invoice = await invoiceService.getByOrderId(Number(req.params.orderId));
    if (!invoice) return res.status(404).json({ error: "La orden no tiene comprobante de venta" });
    res.json(invoice);
  }),

  // POST /api/invoices — cobra la orden; responde el comprobante completo para imprimirlo
  create: withInvoiceErrors(async (req, res) => {
    const invoice = await invoiceService.create(req.body, req.user.id);
    res.status(201).json({ message: "Comprobante de venta generado correctamente", invoice });
  }),

  // PATCH /api/invoices/:id/void
  void: withInvoiceErrors(async (req, res) => {
    const invoice = await invoiceService.void(Number(req.params.id), req.body, req.user.id);
    if (!invoice) return res.status(404).json(NOT_FOUND);
    res.json({ message: "Comprobante de venta anulado correctamente", invoice });
  }),
};
