import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import OrderDetailModal from "./OrderDetailModal";
import { showSystemErrorAlert } from "@/shared/services/alertService";
import { ordens as ordersData } from "../data/ordens";

export default function OrdensRowActions({ order, onDeleted }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleDelete = async () => {
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
                  popup: "rounded-2x1",
                  title: "text-green-600",  
                  confirmButton: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 cursor-pointer rounded-lg",
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
        className="p-1 rounded hover:bg-gray-100 cursor-pointer text-red-600 hover:text-red-800"
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