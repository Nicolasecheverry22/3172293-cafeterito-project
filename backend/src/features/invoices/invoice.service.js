import { invoiceRepository } from "./invoice.repository.js";
import { httpError } from "../../utils/httpError.js";
import { OPEN_ORDER_STATUSES } from "../orders/order.constants.js";

// La entrada llega validada por invoice.schema.js. Aquí van las reglas que requieren la BD.
// Los montos se calculan en CENTAVOS (enteros) para evitar errores de coma flotante y se
// envían a PostgreSQL como texto con 2 decimales.

const DEFAULT_CUSTOMER = "Consumidor final";
export const MAX_TIP_RATIO = 0.2; // la propina no puede superar el 20 % del subtotal

const toCents = (value) => Math.round(Number(value) * 100);
const fromCents = (cents) => (cents / 100).toFixed(2);

// INVOICE_TAX_RATE: fracción decimal (0.08 = impuesto al consumo del 8 %). Por defecto 0.
// server.js valida el formato al arrancar.
export const getTaxRate = () => {
  const rate = Number(process.env.INVOICE_TAX_RATE || 0);
  return Math.round(rate * 10_000) / 10_000; // NUMERIC(5,4)
};

// Calcula el comprobante solo con datos del servidor (ignora cualquier total del cliente).
function computeTotals(orderItems, { paymentMethod, amountReceived, tip }) {
  const items = orderItems.map((item) => {
    const lineCents = item.quantity * toCents(item.unitPrice);
    return {
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: fromCents(toCents(item.unitPrice)),
      lineTotal: fromCents(lineCents),
      lineCents,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineCents, 0);
  const taxRate = getTaxRate();
  const taxAmount = Math.round(subtotal * taxRate);
  const tipCents = toCents(tip ?? 0);
  if (tipCents > Math.round(subtotal * MAX_TIP_RATIO)) {
    throw httpError(400, "La propina no puede superar el 20 % del subtotal");
  }
  const total = subtotal + taxAmount + tipCents;

  let received = null;
  let change = null;
  if (paymentMethod === "efectivo") {
    received = toCents(amountReceived);
    if (received < total) {
      throw httpError(400, "El valor recibido es menor que el total a pagar");
    }
    change = received - total;
  }

  return {
    items,
    amounts: {
      subtotal: fromCents(subtotal),
      taxRate,
      taxAmount: fromCents(taxAmount),
      tip: fromCents(tipCents),
      total: fromCents(total),
      amountReceived: received === null ? null : fromCents(received),
      changeGiven: change === null ? null : fromCents(change),
    },
  };
}

export const invoiceService = {
  // Parámetros que el modal de cobro necesita para mostrar el total y el cambio en vivo
  // (el servidor vuelve a calcular todo al cobrar).
  getSettings() {
    return { taxRate: getTaxRate(), maxTipRatio: MAX_TIP_RATIO };
  },

  async list(query) {
    return await invoiceRepository.list(query);
  },

  async getById(id) {
    return await invoiceRepository.getById(id);
  },

  async getByOrderId(orderId) {
    return await invoiceRepository.getByOrderId(orderId);
  },

  async getReportData(query) {
    return await invoiceRepository.getReportData(query);
  },

  // Cobra una orden: crea el comprobante y pasa la orden a 'pagada' en UNA transacción.
  async create({ orderId, paymentMethod, amountReceived, tip, customer }, cashierId) {
    // Regla 9 (también en Joi): con documento, el nombre es obligatorio
    if (customer?.document && !customer?.name) {
      throw httpError(400, "Si el cliente tiene documento, su nombre es obligatorio");
    }

    const invoiceId = await invoiceRepository.withTransaction(async (client) => {
      const order = await invoiceRepository.lockOrder(client, orderId);
      if (!order) throw httpError(404, "Orden no encontrada");
      if (!OPEN_ORDER_STATUSES.includes(order.status)) {
        throw httpError(409, "La orden ya fue pagada o cancelada");
      }

      const orderItems = await invoiceRepository.getOrderItems(client, orderId);
      if (orderItems.length === 0) {
        throw httpError(409, "La orden no tiene platillos para cobrar");
      }

      const { items, amounts } = computeTotals(orderItems, { paymentMethod, amountReceived, tip });

      const invoice = await invoiceRepository.insertInvoice(client, {
        orderId,
        cashierId,
        waiterId: order.waiterId,
        tableNumber: order.tableNumber,
        customerName: customer?.name ?? DEFAULT_CUSTOMER,
        customerDocumentType: customer?.documentType ?? null,
        customerDocument: customer?.document ?? null,
        paymentMethod,
        ...amounts,
      });
      await invoiceRepository.insertItems(client, invoice.id, items);
      await invoiceRepository.setOrderStatus(client, orderId, "pagada");
      return invoice.id;
    });

    return await invoiceRepository.getById(invoiceId);
  },

  // Anular: requiere void_invoice (la ruta lo verifica) y solo comprobantes 'emitida'.
  // La orden pasa a 'cancelada'. El comprobante nunca se borra ni se edita; su número
  // no se reutiliza.
  async void(id, { reason }, userId) {
    const found = await invoiceRepository.withTransaction(async (client) => {
      const invoice = await invoiceRepository.lockInvoice(client, id);
      if (!invoice) return false;
      if (invoice.status !== "emitida") {
        throw httpError(409, "El comprobante ya está anulado");
      }
      await invoiceRepository.markVoided(client, id, { reason, userId });
      await invoiceRepository.setOrderStatus(client, invoice.orderId, "cancelada");
      return true;
    });

    return found ? await invoiceRepository.getById(id) : undefined;
  },
};
