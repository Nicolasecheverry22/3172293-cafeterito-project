import { Eye, Pencil, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import OrderDetailModal from "./OrderDetailModal";
import { showSystemErrorAlert } from "@/shared/services/alertService";
import { ordens as ordersData } from "../data/ordens";

export default function OrdensRowActions({ order, onDeleted }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 1. Ir a la vista de visualizar
  const handleView = () => {
    navigate(`/orders/${order.id}`);
  };

  // 2. Ir a la vista de editar
  const handleEdit = () => {
    navigate(`/orders/${order.id}/edit`);
  };

  // 4. Lógica de eliminación
  const handleDelete = async () => {
    // Restricción: Si la orden está pagada, se bloquea la eliminación
    if (order.status?.toLowerCase() === "pagada") {
      await Swal.fire({
        title: "Acción no permitida",
        text: "Esta orden no puede ser eliminada porque ya se encuentra pagada.",
        icon: "error",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "rounded-2xl",
          title: "!text-red-600 font-bold",
          confirmButton:
            "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg font-medium",
        },
        buttonsStyling: false,
      });
      return;
    }

    // Confirmación para órdenes activas
    const result = await Swal.fire({
      title: "¿Eliminar orden?",
      text: `Esta acción eliminará la orden #${order.id} y no se puede revertir.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        title: "!text-amber-600 font-bold",
        confirmButton:
          "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg ml-2 font-medium",
        cancelButton:
          "!bg-gray-500 hover:!bg-gray-600 text-white cursor-pointer px-4 py-2 rounded-lg font-medium",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      const index = ordersData.findIndex((o) => o.id === order.id);

      if (index !== -1) {
        ordersData.splice(index, 1);
      }

      await Swal.fire({
        title: "¡Orden eliminada!",
        text: "La orden fue eliminada correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "rounded-2xl",
          title: "!text-green-600 font-bold",
          confirmButton:
            "!bg-green-600 hover:!bg-green-700 text-white px-4 py-2 cursor-pointer rounded-lg font-medium",
          timerProgressBar: "!bg-green-600",
        },
        buttonsStyling: false,
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
        className="p-1 rounded hover:bg-gray-100 text-gray-900 cursor-pointer transition-colors"
      >
        <Eye size={16} />
      </button>

      {/* 2. Lápiz: Vista de editar */}
      <button
        onClick={handleEdit}
        title="Editar orden"
        className="p-1 rounded hover:bg-gray-100 text-gray-900 cursor-pointer transition-colors"
      >
        <Pencil size={16} />
      </button>

      {/* 3. Ícono de documento: Modal de detalles */}
      <button
        onClick={() => setOpen(true)}
        title="Ver detalles completos"
        className="p-1 rounded hover:bg-gray-100 text-gray-900 cursor-pointer transition-colors"
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