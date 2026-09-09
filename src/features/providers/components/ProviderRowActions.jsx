// Iconos usados en los botones de acciones
import { Pencil, Trash2, Eye } from "lucide-react";

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

       {/* Botón visualizar */}
      <button
        onClick={() => navigate(`/ProviderView/${provider.id}`)}// Ejecuta la navegación a la página de visualizar usuario
        className="p-1 rounded hover:bg-gray-100"
      >
        <Eye size={16} /> {/* Icono de editar */}
      </button>

      {/* Botón editar */}
      <button
        onClick={() => navigate(`/EditProvider/${provider.id}`)}
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