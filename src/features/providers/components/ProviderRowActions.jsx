// Iconos usados en los botones de acciones
import { Pencil, Trash2, Eye } from "lucide-react";

// Hook de React Router para navegar programáticamente entre rutas
import { useNavigate } from "react-router-dom";

import { showConfirmDeleteAlert, showSuccessAlert, showErrorAlert } from "@/shared/services/alertService";

import { providers as providersData } from "../data/providers";

export default function ProviderRowActions({ provider, onDeleted }) {

  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/EditProvider/${provider.id}`);
  };

  const handleDelete = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar proveedor?",
      text: `Esta acción eliminará a "${provider.providerName}" y no se puede revertir.`,
    });

    if (!result.isConfirmed) return;

    try {
      const index = providersData.findIndex((p) => p.id === provider.id);
      if (index !== -1) providersData.splice(index, 1);
      // TODO: reemplazar por llamada real (ej. providerService.delete(provider.id))

      await showSuccessAlert({
        title: "Proveedor eliminado",
        text: "El proveedor fue eliminado correctamente.",
        timer: 2000,
      });

      onDeleted?.(provider.id);
    } catch (error) {
      console.error("Error al eliminar el proveedor:", error);
      await showErrorAlert({
        title: "Error al eliminar el proveedor",
        text: "El proveedor no pudo ser eliminado. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-2">

      <button
        onClick={() => navigate(`/ProviderView/${provider.id}`)}
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

    </div>
  );
}