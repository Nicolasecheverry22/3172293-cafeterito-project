import { Eye, Pencil, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


import OrderDetailModal from "./OrderDetailModal";
import { 
  showSystemErrorAlert,
  showSuccessAlert,
  showConfirmDeleteAlert
  } from "@/shared/services/alertService";
import { ordens as ordersData } from "../data/ordens";

export default function OrdensRowActions({ order, onDeleted }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 1. Ir a la vista de visualizar
  const handleView = () => {
    navigate(`/OrderView/${order.id}`);
  };

  // 2. Ir a la vista de editar
  const handleEdit = () => {
    navigate(`/EditOrder/${order.id}`);
  };

  // 4. Lógica de eliminación
  const handleDelete = async () => {
    // Restricción: Si la orden está pagada, se bloquea la eliminación
    if (order.status?.toLowerCase() === "pagada") {
      await showSystemErrorAlert({
        title: "Acción no permitida",
        text: "Esta orden no puede ser eliminada porque ya se encuentra pagada."
      });
      return;
    }

    // Confirmación para órdenes activas
    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar orden?",
      text: `Esta acción eliminará la orden #${order.id} y no se puede revertir.`,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const index = ordersData.findIndex((o) => o.id === order.id);

      if (index !== -1) {
        ordersData.splice(index, 1);
      }

      const result = await showSuccessAlert({
        title: "¡Orden eliminada!",
        text: "La orden fue eliminada correctamente.",
      });

      onDeleted?.(order.id);
    } catch (error) {
      console.error("Error al eliminar la orden:", error);

      await showSystemErrorAlert({
        text: "La orden no pudo ser eliminada. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-1.5 items-center">
      {/* 1. Ojo: Vista de visualizar */}
      <button
        onClick={handleView}
        title="Visualizar orden"
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
      >
        <Eye size={16} />
      </button>

      {/* 2. Lápiz: Vista de editar */}
      <button
        onClick={handleEdit}
        title="Editar orden"
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
      >
        <Pencil size={16} />
      </button>

      {/* 3. Ícono de documento: Modal de detalles */}
      <button
        onClick={() => setOpen(true)}
        title="Ver detalles completos"
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
      >
        <FileText size={16} />
      </button>

      {/* 4. Caneca: Eliminar */}
      <button
        onClick={handleDelete}
        title="Eliminar orden"
        className="p-1 rounded hover:bg-red-50 text-red-600 hover:text-red-800 cursor-pointer transition-colors"
      >
        <Trash2 size={16} />
      </button>

      {/* Modal de detalles */}
      <OrderDetailModal
        isOpen={open}
        onClose={() => setOpen(false)}
        order={order}
      />
    </div>
  );
}