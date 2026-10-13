// Iconos usados en los botones de acciones
import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  showConfirmDeleteAlert,
  showDeleteCancelAlert,
  showSystemErrorAlert,
  showSuccessAlert
} from "@/shared/services/alertService";

import { users as usersData } from "../data/users";


export default function UserRowActions({ user, onDeleted }) {
  const navigate = useNavigate();

 
  const handleEdit = () => {
    navigate(`/EditUser/${user.id}`);
  };

  
  const handleDelete = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar usuario?",
      text: `Esta acción eliminará a "${user.userName || user.nombre || "este usuario"} y no se podrá revertir.`,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Operación cancelada",
        text: "El usuario no fue eliminado.",
      });
      return;
    }

    try {
      const index = usersData.findIndex((u) => u.id === user.id);
      if (index !== -1) usersData.splice(index, 1);
      

      const result = await showSuccessAlert({
        title: "¡Usuario eliminado!",
        text: "El usuario fue eliminado correctamente."
      });

      onDeleted?.(user.id); 
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      await showSystemErrorAlert({
        text: "El usuario no pudo ser eliminado. Intenta nuevamente.",
      });
    }
  };

  return (
    // Contenedor de los botones de acciones
    <div className="flex gap-2">
      {/* Botón visualizar */}
      <button
        onClick={() => navigate(`/UserView/${user.id}`)}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Visualizar usuario"
      >
        <Eye size={16} />
      </button>

      {/* Botón editar */}
      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
        title="Editar usuario"
      >
        <Pencil size={16} />
      </button>

      {/* Botón eliminar */}
      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-gray-100 cursor-pointer text-red-600 hover:text-red-800"
        title="Eliminar usuario"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}