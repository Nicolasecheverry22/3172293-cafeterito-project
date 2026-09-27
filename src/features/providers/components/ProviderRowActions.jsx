// Iconos usados en los botones de acciones
import { Pencil, Trash2, Eye } from "lucide-react";

// Hook de React Router para navegar programáticamente entre rutas
import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import {
  showDeleteCancelAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";

import { providers as providersData } from "../data/providers";

export default function ProviderRowActions({ provider, onDeleted }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/EditProvider/${provider.id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar proveedor?",
      text: `Esta acción eliminará a "${provider.providerName || provider.nombre || "este proveedor"}" y no se podrá revertir.`,
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

    if (!result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Operación cancelada",
        text: "El proveedor no fue eliminado.",
      });
      return;
    }

    try {
      const index = providersData.findIndex((p) => p.id === provider.id);
      if (index !== -1) providersData.splice(index, 1);
      // TODO: reemplazar por llamada real (ej. providerService.delete(provider.id))

      await Swal.fire({
              title: "¡Proveedor eliminado!",
              text: "El proveedor fue eliminado correctamente.",
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

      onDeleted?.(provider.id);
    } catch (error) {
      console.error("Error al eliminar el proveedor:", error);
      await showSystemErrorAlert({
        text: "El proveedor no pudo ser eliminado. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/ProviderView/${provider.id}`)}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Visualizar proveedor"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Editar proveedor"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer text-red-600 hover:text-red-800"
        title="Eliminar proveedor"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}