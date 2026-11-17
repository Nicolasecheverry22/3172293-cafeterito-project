import { Eye, Pencil, FileText, Ban } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import OrderDetailModal from "./OrderDetailModal";
import { confirmAction } from "@/shared/services/confirmAction";
import { cancelOrder, OPEN_ORDER_STATUSES } from "@/services/orderApi";

// Acciones por fila. No existe "Eliminar": la orden se ANULA (estado "cancelada").
// Solo se pueden anular o editar órdenes abiertas (activa / lista para entrega).
export default function OrdensRowActions({ order, onChanged }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
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
    <div className="flex gap-1.5 items-center">
      <button
        onClick={() => navigate(`/OrderView/${order.id}`)}
        title="Visualizar orden"
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
      >
        <Eye size={16} />
      </button>

      {isOpen && (
        <button
          onClick={() => navigate(`/EditOrder/${order.id}`)}
          title="Editar orden"
          className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        >
          <Pencil size={16} />
        </button>
      )}

      <button
        onClick={() => setOpen(true)}
        title="Ver detalles completos"
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
      >
        <FileText size={16} />
      </button>

      {isOpen && (
        <button
          onClick={handleCancel}
          title="Anular orden"
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer transition-colors"
        >
          <Ban size={16} />
        </button>
      )}

      <OrderDetailModal isOpen={open} onClose={() => setOpen(false)} order={order} />
    </div>
  );
}
