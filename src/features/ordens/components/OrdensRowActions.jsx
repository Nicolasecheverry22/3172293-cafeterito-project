import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderDetailModal from "./OrderDetailModal";
import {
  showConfirmDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared/services/alertService";
import { ordens as ordersData } from "../data/ordens";

export default function OrdensRowActions({ order, onDeleted }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleDelete = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar orden?",
      text: `Esta acción eliminará la orden #${order.id} y no se puede revertir.`,
    });

    if (!result.isConfirmed) return;

    try {
      const index = ordersData.findIndex((o) => o.id === order.id);

      if (index !== -1) {
        ordersData.splice(index, 1);
      }

      await showSuccessAlert({
        title: "Orden eliminada",
        text: "La orden fue eliminada correctamente.",
        timer: 2000,
      });

      onDeleted?.(order.id);
    } catch (error) {
      console.error("Error al eliminar la orden:", error);

      await showErrorAlert({
        title: "Error al eliminar la orden",
        text: "La orden no pudo ser eliminada. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setOpen(true)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Trash2 size={16} />
      </button>

      <OrderDetailModal
        isOpen={open}
        onClose={() => setOpen(false)}
        order={order}
      />
    </div>
  );
}