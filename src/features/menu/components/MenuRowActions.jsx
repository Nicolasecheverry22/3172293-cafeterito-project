import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MenuRowActions({ product }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/menu/${product.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar platillo:", product.id);
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