import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  showConfirmDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared/services/alertService";

export default function MenuRowActions({ product, onDeleted }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/menu/${product.id}/edit`);
  };

  const handleDelete = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar platillo?",
      text: `Esta acción eliminará "${product.productName}" y no se puede revertir.`,
    });

    if (!result.isConfirmed) return;

    try {
      // La eliminación real del dato se implementará
      // cuando confirmemos la fuente de datos del menú.

      await showSuccessAlert({
        title: "Platillo eliminado",
        text: "El platillo fue eliminado correctamente.",
        timer: 2000,
      });

      onDeleted?.(product.id);
    } catch (error) {
      console.error("Error al eliminar el platillo:", error);

      await showErrorAlert({
        title: "Error al eliminar el platillo",
        text: "El platillo no pudo ser eliminado. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-2">
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
