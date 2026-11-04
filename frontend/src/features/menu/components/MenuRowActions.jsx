import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";


import { showSystemErrorAlert } from "@/shared/services/alertService";

export default function MenuRowActions({ product, onDeleted }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/EditProduct/${product.id}`);
  };

  const handleDelete = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar platillo?",
      text: `Esta acción eliminará "${product.productName}" y no se puede revertir.`,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const result = await showSuccessAlert({
        title: "¡Platillo eliminado!",
        text: "El platillo fue eliminado correctamente.",
      });

      onDeleted?.(product.id);
    } catch (error) {
      console.error("Error al eliminar el platillo:", error);

      await showSystemErrorAlert({
        text: "El platillo no pudo ser eliminado. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-2">
      {/* Visualizar Platillo */}
      <button
        onClick={() => navigate(`/ProductView/${product.id}`)}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Visualizar platillo"
      >
        <Eye size={16} />
      </button>

      {/* Editar Platillo */}
      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Editar platillo"
      >
        <Pencil size={16} />
      </button>

      {/* Eliminar Platillo */}
      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer text-red-600 hover:text-red-800"
        title="Eliminar platillo"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}