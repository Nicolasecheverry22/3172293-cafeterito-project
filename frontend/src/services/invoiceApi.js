// Llamadas al API del backend para comprobantes de venta (documento sin validez fiscal).
import { api } from "./apiClient";

// Deben coincidir con el backend (invoice.schema.js / migración 0040)
export const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
];
export const INVOICE_STATUSES = [
  { value: "emitida", label: "Emitida" },
  { value: "anulada", label: "Anulada" },
];
export const CUSTOMER_DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PEP", label: "PEP" },
  { value: "PPT", label: "PPT" },
];
export const DEFAULT_CUSTOMER = "Consumidor final";

export const paymentMethodLabel = (value) =>
  PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value ?? "-";

// Badges de estado con variantes de modo oscuro (tokens semánticos)
export const INVOICE_STATUS_STYLES = {
  emitida: "bg-success-container text-on-success-container border-success/30",
  anulada: "bg-error-container text-on-error-container border-error/30",
};

export const formatCOP = (amount) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })
    .format(amount ?? 0);

export const formatDateTime = (iso) =>
  iso
    ? new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso))
    : "-";

// { taxRate, maxTipRatio } — el servidor recalcula todo al cobrar
export const getInvoiceSettings = () => api.get("/invoices/settings");

// query: { from, to, status, paymentMethod, cashierId, search, page, limit }
export const getInvoices = (query) => api.get("/invoices", { query });

export const getInvoiceById = (id) => api.get(`/invoices/${id}`);

export const getInvoiceByOrderId = (orderId) => api.get(`/invoices/by-order/${orderId}`);

// payload: { orderId, paymentMethod, amountReceived?, tip?, customer? } → { message, invoice }
export const createInvoice = (payload) => api.post("/invoices", payload);

// Solo Administrador (el backend responde 403 a los demás)
export const voidInvoice = (id, reason) => api.patch(`/invoices/${id}/void`, { reason });

// { invoices, totals: { count, issuedCount, voidedCount, totalSold, totalTax, totalTips, byPaymentMethod, byDay } }
export const getInvoiceReportData = (query) => api.get("/invoices/report-data", { query });
