// Iconos usados en los botones
import { Pencil, Trash2 } from "lucide-react";


// Hook para navegación
import { useNavigate } from "react-router-dom";


// Acciones disponibles para cada producto
export default function InventoryRowActions({ product }) {


  const navigate = useNavigate();


  // Editar producto
  const handleEdit = () => {
    navigate(`/inventory/${product.id}/edit`);
  };


  // Eliminar producto
  const handleDelete = () => {
    console.log("Eliminar producto:", product.id);
  };


  return (

    <div className="flex gap-2">


      {/* Botón editar */}
      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Pencil size={16} />
      </button>



      {/* Botón eliminar */}
      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Trash2 size={16} />
      </button>


    </div>
  );
}