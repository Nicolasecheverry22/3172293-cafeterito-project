import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Printer, Ban } from "lucide-react";
import { Button } from "@/shared";
import usePermission from "@/shared/hooks/usePermission";
import { printInvoiceById } from "../utils/invoicePdf";
import VoidInvoiceModal from "./VoidInvoiceModal";

// Acciones por fila. Sin editar ni eliminar: un comprobante solo se anula (void_invoice).
// Sin el permiso la acción se ve deshabilitada (no se oculta).
export default function InvoiceRowActions({ invoice, onChanged }) {
  const navigate = useNavigate();
  const [voiding, setVoiding] = useState(false);
  const { guard } = usePermission();
  const canBeVoided = invoice.status === "emitida";

  return (
    <div className="row-actions">
      <Button
        variant="info"
        size="xs"
        shape="pill"
        onClick={() => navigate(`/InvoiceView/${invoice.id}`)}
        title="Ver comprobante"
        aria-label={`Ver comprobante ${invoice.invoiceNumber}`}
        className="row-actions__btn !px-0 !w-12 !h-12"
        {...guard("view_invoice", "ver comprobantes")}
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant="detail"
        size="xs"
        shape="pill"
        onClick={() => printInvoiceById(invoice.id)}
        title="Imprimir / PDF"
        aria-label={`Imprimir comprobante ${invoice.invoiceNumber}`}
        className="row-actions__btn !px-0 !w-12 !h-12"
        {...guard("view_invoice", "imprimir comprobantes")}
      >
        <Printer className="w-5 h-5" aria-hidden="true" />
      </Button>

      {canBeVoided && (
        <Button
          variant="disable"
          size="xs"
          shape="pill"
          onClick={() => setVoiding(true)}
          title="Anular comprobante"
          aria-label={`Anular comprobante ${invoice.invoiceNumber}`}
          className="row-actions__btn !px-0 !w-12 !h-12"
          {...guard("void_invoice", "anular comprobantes")}
        >
          <Ban className="w-5 h-5" aria-hidden="true" />
        </Button>
      )}

      {voiding && (
        <VoidInvoiceModal invoice={invoice} onClose={() => setVoiding(false)} onVoided={onChanged} />
      )}
    </div>
  );
}