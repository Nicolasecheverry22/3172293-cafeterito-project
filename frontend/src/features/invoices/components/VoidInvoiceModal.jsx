// Confirmación de anulación con motivo obligatorio (10–300 caracteres, igual que Joi).
// Requiere void_invoice: sin él, "Sí, anular" queda deshabilitado (el backend responde 403).
import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared";
import useDialogA11y from "@/shared/hooks/useDialogA11y";
import usePermission from "@/shared/hooks/usePermission";
import { voidInvoice } from "@/services/invoiceApi";
import { showSuccessAlert } from "@/shared/services/alertService";

const MIN = 10;
const MAX = 300;

export default function VoidInvoiceModal({ invoice, onClose, onVoided }) {
  const { guard } = usePermission();
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const close = () => !submitting && onClose();
  const dialogRef = useDialogA11y(true, close);

  const length = reason.trim().length;
  const reasonError =
    length < MIN ? `El motivo debe tener al menos ${MIN} caracteres` : length > MAX ? `Máximo ${MAX} caracteres` : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (reasonError) return;
    setSubmitting(true);
    setError(null);
    try {
      const { invoice: voided } = await voidInvoice(invoice.id, reason.trim());
      onClose();
      await showSuccessAlert({
        title: "Comprobante anulado",
        text: `${invoice.invoiceNumber} quedó anulado y su orden pasó a "cancelada".`,
      });
      onVoided?.(voided);
    } catch (err) {
      setError(err.message || "No se pudo anular el comprobante.");
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4" onClick={close}>
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="void-invoice-title"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-dvh sm:h-auto rounded-none sm:rounded-shape-xl bg-background text-text-primary p-6 shadow-elevation-3 flex flex-col gap-4 overflow-y-auto"
      >
        <h2 id="void-invoice-title" className="text-xl font-bold text-error">
          ¿Anular {invoice.invoiceNumber}?
        </h2>
        <p className="text-small text-text-secondary">
          El comprobante no se borra: queda marcado como anulado, su número no se reutiliza y la orden
          #{invoice.orderId} pasa a "cancelada". Esta acción no se puede deshacer.
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="void-reason" className={`text-small font-label ${touched && reasonError ? "text-error" : "text-text-secondary"}`}>
            Motivo de anulación (obligatorio)
          </label>
          <textarea
            id="void-reason"
            rows={4}
            maxLength={MAX}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(touched && reasonError)}
            aria-describedby="void-reason-help"
            placeholder="Ej: se cobró a la mesa equivocada"
            className={`w-full rounded-shape-sm border bg-background p-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring ${touched && reasonError ? "border-error" : "border-border"}`}
          />
          <p id="void-reason-help" className={`text-small ${touched && reasonError ? "text-error" : "text-text-secondary"}`}>
            {touched && reasonError ? reasonError : `${length}/${MAX} caracteres`}
          </p>
        </div>

        {error && <p className="text-small text-error" role="alert">{error}</p>}

        <div className="flex justify-end gap-3 mt-auto sm:mt-2 max-sm:flex-col-reverse max-sm:*:w-full">
          <Button variant="secondary" onClick={close} disabled={submitting}>Cancelar</Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-error! text-on-error! hover:bg-error/90!"
            {...guard("void_invoice", "anular comprobantes")}
          >
            {submitting ? "Anulando..." : "Sí, anular"}
          </Button>
        </div>
      </form>
    </div>,
    document.body
  );
}
