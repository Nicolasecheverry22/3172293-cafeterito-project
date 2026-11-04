import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  showSuccessAlert,
  showDeleteCancelAlert,
  showSystemErrorAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function InventoryRowActions({ provision, onDeleted }) {
  const navigate = useNavigate();

  // Obtener el ID dinámico de forma segura (soporta id o provisionId)
  const targetId = provision?.id ?? provision?.provisionId;

  const handleView = () => {
    if (!provision.id) return;
    navigate(`/InventoryView/${provision.id}`);
  };

  const handleEdit = () => {
    if (!provision.id) return;
    navigate(`/editInventory/${provision.id}`); 
  };

  const handleDelete = async () => {
    if (!targetId) return;

    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar suministro?",
      text: `Esta acción eliminará "${provision.provisionName || provision.nombre || "este suministro"}" del inventario y no se podrá revertir.`,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Operación cancelada",
        text: "El suministro no fue eliminado.",
      });
      return;
    }

    try {
      console.log("Suministro eliminado:", targetId);

      await showSuccessAlert({
        title: "¡Suministro eliminado!",
        text: "El suministro fue eliminado del inventario correctamente.",
      });

      onDeleted?.(targetId);
    } catch (error) {
      console.error("Error al eliminar el suministro:", error);
      await showSystemErrorAlert({
        text: "El suministro no pudo ser eliminado. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={handleView}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Ver detalles"
      >
        <Eye size={18} />
      </button>

      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Editar suministro"
      >
        <Pencil size={18} />
      </button>

      <button
        onClick={handleDelete}
        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
        title="Eliminar suministro"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}