import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  showSuccessAlert,
  showDeleteCancelAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";

export default function InventoryRowActions({ product, onDeleted }) {
  const navigate = useNavigate();

  // Redirigir a la vista del producto pasando su ID
 
  const handleEdit = () => {
    const id = product.id || product.productId;
    navigate(`/EditProduct/${id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: `Esta acción eliminará "${product.productName || product.nombre || "este producto"}" del inventario y no se podrá revertir.`,
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
        text: "El producto no fue eliminado.",
      });
      return;
    }

    try {
      console.log("Producto eliminado:", product.id);

      await showSuccessAlert({
        title: "¡Producto eliminado!",
        text: "El producto fue eliminado del inventario correctamente.",
      });

      onDeleted?.(product.id);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      await showSystemErrorAlert({
        text: "El producto no pudo ser eliminado. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/ProvisionsView/${product.id}`)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={() => navigate(`/EditProvisions/${product.id}`)}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Editar producto"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer text-red-600 hover:text-red-800"
        title="Eliminar producto"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}