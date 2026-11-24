import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Printer, Ban } from "lucide-react";
import { hasSessionGroup } from "@/services/apiClient";
import { printInvoiceById } from "../utils/invoicePdf";
import VoidInvoiceModal from "./VoidInvoiceModal";

// Acciones por fila. Sin editar ni eliminar: un comprobante solo se anula (Administrador).
export default function InvoiceRowActions({ invoice, onChanged }) {
  const navigate = useNavigate();
  const [voiding, setVoiding] = useState(false);
  const canVoid = invoice.status === "emitida" && hasSessionGroup("Administrador");

  return (
    <div className="row-actions">
      <button
        type="button"
        onClick={() => navigate(`/InvoiceView/${invoice.id}`)}
        title="Ver comprobante"
        aria-label={`Ver comprobante ${invoice.invoiceNumber}`}
        className="row-actions__btn touch-target hover:bg-surface-muted"
      >
        <Eye size={20} />
      </button>

      <button
        type="button"
        onClick={() => printInvoiceById(invoice.id)}
        title="Imprimir / PDF"
        aria-label={`Imprimir comprobante ${invoice.invoiceNumber}`}
        className="row-actions__btn touch-target hover:bg-surface-muted"
      >
        <Printer size={20} />
      </button>

      {canVoid && (
        <button
          type="button"
          onClick={() => setVoiding(true)}
          title="Anular comprobante"
          aria-label={`Anular comprobante ${invoice.invoiceNumber}`}
          className="row-actions__btn touch-target text-error hover:bg-error-container hover:text-on-error-container"
        >
          <Ban size={20} />
        </button>
      )}

      {voiding && (
        <VoidInvoiceModal invoice={invoice} onClose={() => setVoiding(false)} onVoided={onChanged} />
      )}
    </div>
  );
}
