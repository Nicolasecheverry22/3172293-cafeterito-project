import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Receipt, Printer, Ban, ClipboardList } from "lucide-react";
import { Input, Button } from "@/shared";
import usePermission from "@/shared/hooks/usePermission";
import {
  getInvoiceById, formatCOP, formatDateTime, paymentMethodLabel, INVOICE_STATUS_STYLES,
} from "@/services/invoiceApi";
import { printReceiptPdf } from "@/features/invoices/utils/invoicePdf";
import VoidInvoiceModal from "@/features/invoices/components/VoidInvoiceModal";

const STATUS_LABELS = { emitida: "Emitida", anulada: "Anulada" };

export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const { guard } = usePermission();

  const load = useCallback(() => {
    getInvoiceById(id).then(setInvoice).catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex items-center gap-3 mt-10 ml-12">
          <Receipt className="w-10 h-10 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">Comprobante de venta</h1>
        </div>
        <p className="ml-12 mt-8 text-error">El comprobante solicitado no existe.</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando comprobante...</p>
      </div>
    );
  }

  const isVoided = invoice.status === "anulada";
  const canBeVoided = !isVoided;
  const customerDocument = invoice.customerDocument
    ? `${invoice.customerDocumentType ?? ""} ${invoice.customerDocument}`.trim()
    : "Sin documento";

  return (
    <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
      <div className="max-w-7xl w-full mx-auto px-0 sm:px-4 mt-4 mb-6 flex items-center gap-3">
        <Receipt className="w-9 h-9 text-text-primary shrink-0" />
        <div className="min-w-0">
          <h1 className="font-heading font-bold text-text-primary text-2xl">
            Comprobante de venta {invoice.invoiceNumber}
          </h1>
          <p className="text-small text-text-secondary">Documento sin validez fiscal</p>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-0 sm:px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Estado y acciones */}
        <div className="bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-6 text-center">
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-text-primary font-heading font-bold">Estado</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${INVOICE_STATUS_STYLES[invoice.status] ?? ""}`}>
              {STATUS_LABELS[invoice.status] ?? invoice.status}
            </span>
            <p className="text-2xl font-bold text-text-primary">{formatCOP(invoice.total)}</p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <p className="text-text-primary font-heading font-bold">Acciones</p>
            <Button variant="primary" className="w-full gap-2" onClick={() => printReceiptPdf(invoice)}>
              <Printer className="w-5 h-5" aria-hidden="true" /> Imprimir/PDF
            </Button>
            <Button as={Link} to={`/OrderView/${invoice.orderId}`} variant="tertiary" className="w-full gap-2"
              {...guard("view_order", "ver órdenes")}>
              <ClipboardList className="w-5 h-5" aria-hidden="true" /> Ver orden #{invoice.orderId}
            </Button>
            {canBeVoided && (
              <Button className="w-full gap-2 bg-error! text-on-error! hover:bg-error/90!" onClick={() => setVoiding(true)}
                {...guard("void_invoice", "anular comprobantes")}>
                <Ban className="w-5 h-5" aria-hidden="true" /> Anular comprobante
              </Button>
            )}
          </div>
        </div>

        {/* Detalle */}
        <div className="lg:col-span-3 bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col gap-6">
          {isVoided && (
            <div role="note" className="rounded-shape-lg border border-error/40 bg-error-container text-on-error-container p-4 space-y-1">
              <p className="font-bold">Comprobante anulado</p>
              <p><span className="font-semibold">Motivo:</span> {invoice.voidReason}</p>
              <p><span className="font-semibold">Anulado por:</span> {invoice.voidedByName ?? "-"}</p>
              <p><span className="font-semibold">Fecha:</span> {formatDateTime(invoice.voidedAt)}</p>
            </div>
          )}

          <div className="w-full bg-surface rounded-shape-lg p-4 sm:p-6 shadow-elevation-1 border border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Fecha y hora" value={formatDateTime(invoice.createdAt)} disabled />
            <Input label="Mesa" value={`Mesa ${invoice.tableNumber}`} disabled />
            <Input label="Método de pago" value={paymentMethodLabel(invoice.paymentMethod)} disabled />
            <Input label="Mesero" value={invoice.waiter} disabled />
            <Input label="Cajero" value={invoice.cashier} disabled />
            <Input label="Cliente" value={invoice.customerName} disabled />
            <Input label="Documento del cliente" value={customerDocument} disabled />
          </div>

          <div className="w-full bg-surface rounded-shape-lg p-4 sm:p-6 shadow-elevation-1 border border-border/40 space-y-4">
            <h3 className="text-lg font-heading font-bold text-text-primary">Detalle</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse text-text-primary">
                <thead>
                  <tr className="border-b border-border/40 text-text-primary/70 font-semibold">
                    <th className="py-2 px-3 text-center">Cant.</th>
                    <th className="py-2 px-3">Producto</th>
                    <th className="py-2 px-3 text-right hidden sm:table-cell">Precio unitario</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/20">
                      <td className="py-3 px-3 text-center">{item.quantity}</td>
                      <td className="py-3 px-3 font-medium">{item.productName}</td>
                      <td className="py-3 px-3 text-right whitespace-nowrap hidden sm:table-cell">{formatCOP(item.unitPrice)}</td>
                      <td className="py-3 px-3 text-right font-semibold whitespace-nowrap">{formatCOP(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto w-full sm:w-80 space-y-1 text-text-primary pt-4 border-t border-border/40">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCOP(invoice.subtotal)}</dd></div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between">
                  <dt>Impuesto ({(invoice.taxRate * 100).toLocaleString("es-CO")} %)</dt>
                  <dd>{formatCOP(invoice.taxAmount)}</dd>
                </div>
              )}
              {invoice.tip > 0 && (
                <div className="flex justify-between"><dt>Propina</dt><dd>{formatCOP(invoice.tip)}</dd></div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/40">
                <dt>Total</dt><dd>{formatCOP(invoice.total)}</dd>
              </div>
              {invoice.paymentMethod === "efectivo" && (
                <>
                  <div className="flex justify-between"><dt>Recibido</dt><dd>{formatCOP(invoice.amountReceived)}</dd></div>
                  <div className="flex justify-between"><dt>Cambio</dt><dd>{formatCOP(invoice.changeGiven)}</dd></div>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>

      {voiding && <VoidInvoiceModal invoice={invoice} onClose={() => setVoiding(false)} onVoided={load} />}
    </div>
  );
}
