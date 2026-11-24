// Validación de entrada del feature invoices (comprobantes de venta).
// Los precios y totales NO se aceptan del cliente: stripUnknown elimina subtotal/total/items
// y el servicio los calcula desde order_items.
import { Joi, isoDate } from "../../utils/joi.js";
import { paginationFields } from "../../utils/listQuery.js";

// Deben coincidir con los CHECK de la migración 0040
export const PAYMENT_METHODS = ["efectivo", "tarjeta", "transferencia"];
export const INVOICE_STATUSES = ["emitida", "anulada"];
export const CUSTOMER_DOCUMENT_TYPES = ["CC", "CE", "NIT", "PEP", "PPT"];

const money = () => Joi.number().min(0).precision(2).max(9_999_999_999.99);

const customer = Joi.object({
  name: Joi.string().trim().min(2).max(100).empty("").label("El nombre del cliente"),
  documentType: Joi.string()
    .trim()
    .uppercase()
    .valid(...CUSTOMER_DOCUMENT_TYPES)
    .empty("")
    .label("El tipo de documento del cliente"),
  document: Joi.string()
    .trim()
    .pattern(/^\d{5,15}(-\d)?$/, { name: "debe tener entre 5 y 15 dígitos (NIT con dígito de verificación opcional)" })
    .empty("")
    .label("El documento del cliente"),
})
  // Con documento, el nombre y el tipo son obligatorios (y viceversa: tipo sin número no sirve)
  .and("documentType", "document")
  .with("document", "name")
  .messages({
    "object.and": "El tipo y el número de documento del cliente van juntos",
    "object.with": "Si el cliente tiene documento, su nombre es obligatorio",
  })
  .empty(null)
  .label("El cliente");

export const createInvoiceSchema = Joi.object({
  orderId: Joi.number().integer().positive().required().label("La orden"),
  paymentMethod: Joi.string()
    .trim()
    .lowercase()
    .valid(...PAYMENT_METHODS)
    .required()
    .label("El método de pago"),
  // Solo en efectivo: obligatorio. En tarjeta/transferencia se descarta lo que llegue.
  amountReceived: Joi.when("paymentMethod", {
    is: "efectivo",
    then: money().required().label("El valor recibido"),
    otherwise: Joi.any().strip(),
  }),
  tip: money().empty("").default(0).label("La propina"),
  customer,
});

export const voidInvoiceSchema = Joi.object({
  reason: Joi.string().trim().min(10).max(300).required().label("El motivo de anulación"),
});

export const orderIdParam = Joi.object({
  orderId: Joi.number().integer().positive().required().label("La orden"),
});

// Filtros comunes al listado y al reporte
const filterFields = {
  from: isoDate().empty("").label("La fecha inicial"),
  to: isoDate().empty("").label("La fecha final"),
  status: Joi.string().trim().lowercase().valid(...INVOICE_STATUSES).empty("").label("El estado"),
  paymentMethod: Joi.string().trim().lowercase().valid(...PAYMENT_METHODS).empty("").label("El método de pago"),
  cashierId: Joi.number().integer().positive().empty("").label("El cajero"),
  search: Joi.string().trim().max(100).empty("").label("La búsqueda"),
};

// GET /api/invoices — paginación solo si llegan page y limit
export const invoiceListQuery = Joi.object({ ...filterFields, ...paginationFields });
export const invoiceReportQuery = Joi.object(filterFields);
