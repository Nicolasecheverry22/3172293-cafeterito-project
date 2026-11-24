// Modal de cobro: genera el comprobante de venta y la orden pasa a "pagada" (mismo POST).
// Los montos que se muestran son una vista previa: el backend recalcula todo desde order_items.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import {
  X, Banknote, CreditCard, ArrowLeftRight, ChevronDown, CheckCircle2, Printer,
} from "lucide-react";
import { Button, Input, Select } from "@/shared";
import useDialogA11y from "@/shared/hooks/useDialogA11y";
import { getOrderById } from "@/services/orderApi";
import {
  createInvoice, getInvoiceSettings, formatCOP, CUSTOMER_DOCUMENT_TYPES, DEFAULT_CUSTOMER,
} from "@/services/invoiceApi";
import { printReceiptPdf } from "../utils/invoicePdf";

const METHODS = [
  { value: "efectivo", label: "Efectivo", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "transferencia", label: "Transferencia", icon: ArrowLeftRight },
];
const BILLS = [20000, 50000, 100000];

// Centavos enteros (igual que el backend) para que la vista previa coincida al peso
const toCents = (value) => Math.round(Number(value || 0) * 100);
const fromCents = (cents) => cents / 100;

// Mismas reglas que customer en invoice.schema.js (Joi)
const customerSchema = z
  .object({
    name: z.string().trim().max(100, "Máximo 100 caracteres"),
    documentType: z.string(),
    document: z
      .string()
      .trim()
      .refine((v) => !v || /^\d{5,15}(-\d)?$/.test(v), "Entre 5 y 15 dígitos (NIT con dígito de verificación opcional)"),
  })
  .superRefine((c, ctx) => {
    if (c.name && c.name.length < 2) ctx.addIssue({ code: "custom", path: ["name"], message: "Mínimo 2 caracteres" });
    if (c.document && !c.name) ctx.addIssue({ code: "custom", path: ["name"], message: "Con documento, el nombre es obligatorio" });
    if (c.document && !c.documentType) ctx.addIssue({ code: "custom", path: ["documentType"], message: "Seleccione el tipo de documento" });
    if (c.documentType && !c.document) ctx.addIssue({ code: "custom", path: ["document"], message: "Ingrese el número de documento" });
  });

export default function PaymentModal({ orderId, onClose, onPaid }) {
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({ taxRate: 0, maxTipRatio: 0.2 });
  const [loadError, setLoadError] = useState(null);

  const [method, setMethod] = useState("efectivo");
  const [received, setReceived] = useState("");
  const [tipMode, setTipMode] = useState("0"); // "0" | "10" | "custom"
  const [tipCustom, setTipCustom] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", documentType: "", document: "" });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [invoice, setInvoice] = useState(null);

  // Mientras se envía no se puede cerrar (evita dudas de si se cobró o no)
  const close = () => !submitting && onClose();
  const dialogRef = useDialogA11y(true, close);

  useEffect(() => {
    Promise.all([getOrderById(orderId), getInvoiceSettings()])
      .then(([o, s]) => {
        setOrder(o);
        setSettings(s);
      })
      .catch((err) => setLoadError(err.message));
  }, [orderId]);

  const totals = useMemo(() => {
    const subtotal = (order?.items ?? []).reduce((sum, i) => sum + i.quantity * toCents(i.price), 0);
    const tax = Math.round(subtotal * settings.taxRate);
    // 10 %: redondeado al peso
    const tip = tipMode === "10" ? Math.round(subtotal * 0.1 / 100) * 100 : tipMode === "custom" ? toCents(tipCustom) : 0;
    const total = subtotal + tax + tip;
    const receivedCents = toCents(received);
    return {
      subtotal, tax, tip, total,
      maxTip: Math.round(subtotal * settings.maxTipRatio),
      received: receivedCents,
      change: receivedCents - total,
    };
  }, [order, settings, tipMode, tipCustom, received]);

  const customerCheck = customerSchema.safeParse(customer);
  const customerErrors = customerCheck.success
    ? {}
    : Object.fromEntries(customerCheck.error.issues.map((i) => [i.path[0], i.message]));

  const tipError =
    tipMode === "custom" && Number(tipCustom) < 0
      ? "La propina no puede ser negativa"
      : totals.tip > totals.maxTip
        ? `La propina no puede superar el ${settings.maxTipRatio * 100} % del subtotal (${formatCOP(fromCents(totals.maxTip))})`
        : null;
  const cashMissing = method === "efectivo" && (received === "" || totals.change < 0);
  const canConfirm = order && !tipError && !cashMissing && customerCheck.success && !submitting;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setSubmitError(null);
    const hasCustomer = customer.name.trim() || customer.document.trim();
    try {
      const { invoice: created } = await createInvoice({
        orderId,
        paymentMethod: method,
        ...(method === "efectivo" && { amountReceived: fromCents(totals.received) }),
        tip: fromCents(totals.tip),
        ...(hasCustomer && {
          customer: {
            name: customer.name.trim(),
            documentType: customer.documentType,
            document: customer.document.trim(),
          },
        }),
      });
      setInvoice(created);
      onPaid?.(created);
    } catch (err) {
      setSubmitError(err.message || "No se pudo generar el comprobante. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const setCustomerField = (e) => setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Contenido ──
  let body;
  if (invoice) {
    body = (
      <div className="payment-modal__receipt" aria-live="polite">
        <CheckCircle2 className="w-14 h-14 text-success" aria-hidden="true" />
        <p className="text-text-secondary">Comprobante de venta generado</p>
        <p className="payment-modal__receipt-number">{invoice.invoiceNumber}</p>
        <p className="text-lg">Total: <strong>{formatCOP(invoice.total)}</strong></p>
        {invoice.paymentMethod === "efectivo" && (
          <p className="text-lg">Cambio: <strong>{formatCOP(invoice.changeGiven)}</strong></p>
        )}
        <p className="text-small text-text-secondary">Documento sin validez fiscal</p>
      </div>
    );
  } else if (loadError) {
    body = <p className="payment-modal__error">No se pudo cargar la orden: {loadError}</p>;
  } else if (!order) {
    body = <p className="text-text-secondary">Cargando orden...</p>;
  } else {
    body = (
      <>
        {/* Resumen (datos del backend) */}
        <section aria-labelledby="payment-summary-title">
          <h3 id="payment-summary-title" className="payment-modal__section-title">Resumen</h3>
          <div className="payment-modal__summary">
            {order.items.map((item) => (
              <div key={item.id} className="payment-modal__line">
                <span>{item.quantity} × {item.dish}</span>
                <span>{formatCOP(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="payment-modal__line payment-modal__line--muted mt-2">
              <span>Subtotal</span><span>{formatCOP(fromCents(totals.subtotal))}</span>
            </div>
            {settings.taxRate > 0 && (
              <div className="payment-modal__line payment-modal__line--muted">
                <span>Impuesto ({(settings.taxRate * 100).toLocaleString("es-CO")} %)</span>
                <span>{formatCOP(fromCents(totals.tax))}</span>
              </div>
            )}
            {totals.tip > 0 && (
              <div className="payment-modal__line payment-modal__line--muted">
                <span>Propina</span><span>{formatCOP(fromCents(totals.tip))}</span>
              </div>
            )}
            <div className="payment-modal__line payment-modal__line--total">
              <span>Total</span><span>{formatCOP(fromCents(totals.total))}</span>
            </div>
          </div>
        </section>

        {/* Método de pago */}
        <section aria-labelledby="payment-method-title">
          <h3 id="payment-method-title" className="payment-modal__section-title">Método de pago</h3>
          <div className="payment-modal__methods" role="radiogroup" aria-labelledby="payment-method-title">
            {METHODS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={method === value}
                onClick={() => setMethod(value)}
                className={`payment-modal__option payment-modal__option--large ${method === value ? "payment-modal__option--active" : ""}`}
              >
                <Icon className="w-6 h-6" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Propina */}
        <section aria-labelledby="payment-tip-title">
          <h3 id="payment-tip-title" className="payment-modal__section-title">Propina (opcional)</h3>
          <div className="payment-modal__options" role="radiogroup" aria-labelledby="payment-tip-title">
            {[["0", "0 %"], ["10", "10 %"], ["custom", "Otro valor"]].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={tipMode === value}
                onClick={() => setTipMode(value)}
                className={`payment-modal__option ${tipMode === value ? "payment-modal__option--active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tipMode === "custom" && (
            <Input
              className="mt-3"
              label="Valor de la propina"
              htmlFor="payment-tip"
              type="number"
              inputMode="numeric"
              min="0"
              value={tipCustom}
              onChange={(e) => setTipCustom(e.target.value)}
              placeholder="0"
            />
          )}
          {tipError && <p className="payment-modal__error mt-2" role="alert">{tipError}</p>}
        </section>

        {/* Efectivo: recibido y cambio en vivo */}
        {method === "efectivo" && (
          <section className="payment-modal__cash" aria-labelledby="payment-cash-title">
            <h3 id="payment-cash-title" className="payment-modal__section-title mb-0!">Efectivo</h3>
            <Input
              label="Recibido"
              htmlFor="payment-received"
              type="number"
              inputMode="numeric"
              min="0"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              placeholder="0"
            />
            <div className="payment-modal__options payment-modal__options--bills">
              <button type="button" className="payment-modal__option" onClick={() => setReceived(String(fromCents(totals.total)))}>
                Exacto
              </button>
              {BILLS.map((bill) => (
                <button
                  key={bill}
                  type="button"
                  className="payment-modal__option"
                  disabled={toCents(bill) < totals.total}
                  onClick={() => setReceived(String(bill))}
                >
                  {bill.toLocaleString("es-CO")}
                </button>
              ))}
            </div>
            <div
              className={`payment-modal__change ${cashMissing ? "payment-modal__change--missing" : ""}`}
              aria-live="polite"
            >
              {cashMissing ? (
                <>
                  <span>Falta</span>
                  <span>{formatCOP(fromCents(Math.max(totals.total - totals.received, 0)))}</span>
                </>
              ) : (
                <>
                  <span>Cambio</span>
                  <span>{formatCOP(fromCents(totals.change))}</span>
                </>
              )}
            </div>
          </section>
        )}

        {/* Cliente (colapsable; por defecto Consumidor final) */}
        <section className="payment-modal__customer">
          <button
            type="button"
            className="payment-modal__customer-toggle"
            aria-expanded={customerOpen}
            aria-controls="payment-customer-fields"
            onClick={() => setCustomerOpen((v) => !v)}
          >
            <span>
              Datos del cliente{" "}
              <span className="font-normal text-text-secondary">
                ({customer.name.trim() || DEFAULT_CUSTOMER})
              </span>
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${customerOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {customerOpen && (
            <div id="payment-customer-fields" className="payment-modal__customer-fields">
              <Input
                label="Nombre o razón social"
                htmlFor="payment-customer-name"
                name="name"
                value={customer.name}
                onChange={setCustomerField}
                placeholder={DEFAULT_CUSTOMER}
                error={customerErrors.name}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Tipo de documento"
                  htmlFor="payment-customer-doctype"
                  name="documentType"
                  value={customer.documentType}
                  onChange={setCustomerField}
                  options={CUSTOMER_DOCUMENT_TYPES}
                  error={customerErrors.documentType}
                />
                <Input
                  label="Número de documento"
                  htmlFor="payment-customer-document"
                  name="document"
                  inputMode="numeric"
                  value={customer.document}
                  onChange={setCustomerField}
                  error={customerErrors.document}
                />
              </div>
            </div>
          )}
        </section>

        {submitError && <p className="payment-modal__error" role="alert">{submitError}</p>}
      </>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="payment-modal-title"
        className="payment-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="payment-modal__header">
          <div className="min-w-0">
            <h2 id="payment-modal-title" className="text-lg font-bold">
              {invoice ? "Comprobante de venta" : `Cobrar orden #${orderId}`}
            </h2>
            {order && <p className="text-small text-text-secondary">Mesa {order.tableNumber} · {order.waiter}</p>}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar ventana de cobro"
            className="touch-target p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-muted cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <X size={20} />
          </button>
        </div>

        <div className="payment-modal__body">{body}</div>

        <div className="payment-modal__footer max-sm:flex-col-reverse max-sm:items-stretch max-sm:*:w-full">
          {invoice ? (
            <>
              <Button variant="secondary" onClick={onClose}>Cerrar</Button>
              <Button variant="primary" onClick={() => printReceiptPdf(invoice)} className="gap-2">
                <Printer className="w-5 h-5" aria-hidden="true" /> Imprimir/PDF
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={close} disabled={submitting}>Cancelar</Button>
              <Button variant="primary" onClick={handleConfirm} disabled={!canConfirm}>
                {submitting ? "Cobrando..." : order ? `Confirmar cobro · ${formatCOP(fromCents(totals.total))}` : "Confirmar cobro"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
