import { Eye, Pencil, FileText, Ban, HandCoins } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import OrderDetailModal from "./OrderDetailModal";
import PaymentModal from "@/features/invoices/components/PaymentModal";
import { confirmAction } from "@/shared/services/confirmAction";
import { cancelOrder, OPEN_ORDER_STATUSES } from "@/services/orderApi";
import usePermission from "@/shared/hooks/usePermission";

// Acciones por fila. No existe "Eliminar": la orden se ANULA (estado "cancelada").
// Solo se pueden cobrar, editar o anular órdenes abiertas (activa / lista para entrega).
// Cobrar genera el comprobante de venta y es el ÚNICO camino para que la orden quede "pagada".
export default function OrdensRowActions({ order, onChanged }) {
  const navigate = useNavigate();
  const { guard } = usePermission();
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const isOpen = OPEN_ORDER_STATUSES.includes(order.status?.toLowerCase());

  const handleCancel = () =>
    confirmAction({
      title: "¿Anular orden?",
      text: `La orden #${order.id} (mesa ${order.tableNumber}) quedará cancelada. Esta acción no se puede deshacer.`,
      confirmText: "Sí, anular",
      action: () => cancelOrder(order.id),
      successTitle: "Orden anulada",
      successText: "La orden fue anulada correctamente.",
      onDone: onChanged,
    });

  return (
    <div className="row-actions">
      {isOpen && (
        <button
          onClick={() => setPaying(true)}
          title="Cobrar orden"
          aria-label={`Cobrar orden ${order.id}`}
          {...guard("create_invoice", "cobrar órdenes")}
          className="row-actions__btn touch-target text-success hover:bg-success-container hover:text-on-success-container cursor-pointer"
        >
          <HandCoins size={20} />
        </button>
      )}

      <button
        onClick={() => navigate(`/OrderView/${order.id}`)}
        title="Visualizar orden"
        {...guard("view_order", "ver el detalle de órdenes")}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
      >
        <Eye size={20} />
      </button>

      {isOpen && (
        <button
          onClick={() => navigate(`/EditOrder/${order.id}`)}
          title="Editar orden"
          {...guard(["update_order", "prepare_order"], "editar órdenes")}
          className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        >
          <Pencil size={20} />
        </button>
      )}

      <button
        onClick={() => setOpen(true)}
        title="Ver detalles completos"
        {...guard("view_order", "ver el detalle de órdenes")}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
      >
        <FileText size={20} />
      </button>

      {isOpen && (
        <button
          onClick={handleCancel}
          title="Anular orden"
          {...guard("cancel_order", "anular órdenes")}
          className="row-actions__btn touch-target hover:bg-error-container text-error hover:text-on-error-container cursor-pointer transition-colors"
        >
          <Ban size={20} />
        </button>
      )}

      <OrderDetailModal isOpen={open} onClose={() => setOpen(false)} order={order} />
      {/* Se monta al abrir: cada cobro empieza con el estado limpio. El listado se refresca
          al cerrar (no al cobrar) para que el comprobante siga visible hasta que lo cierren. */}
      {paying && (
        <PaymentModal
          orderId={order.id}
          onClose={() => {
            setPaying(false);
            if (paying === "paid") onChanged?.();
          }}
          onPaid={() => setPaying("paid")}
        />
      )}
    </div>
  );
}
