// Iconos usados en los botones de acciones
import { Pencil, Trash2 } from "lucide-react";

// Hook de React Router para navegar programáticamente entre rutas
import { useNavigate } from "react-router-dom";

// Componente que renderiza las acciones de cada fila de proveedor
export default function ProviderRowActions({ provider }) {

  const navigate = useNavigate();

  // Acción para editar el proveedor
  const handleEdit = () => {
    navigate(`/providers/${provider.nit}/edit`);
  };

  // Acción para eliminar el proveedor
  const handleDelete = () => {
    console.log("Eliminar proveedor", provider.nit);

    // deleteProvider(provider.nit)
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