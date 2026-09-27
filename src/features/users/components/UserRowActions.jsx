// Iconos usados en los botones de acciones
import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  showDeleteCancelAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";
// Fuente de datos mock de usuarios
import { users as usersData } from "../data/users";

// Componente que renderiza las acciones de cada fila de usuario
// Recibe como prop el objeto user
export default function UserRowActions({ user, onDeleted }) {
  // Hook que permite redirigir a otra ruta desde código
  const navigate = useNavigate();

  // Acción para editar el usuario
  // Redirige a la página de edición usando el id del usuario
  const handleEdit = () => {
    navigate(`/EditUser/${user.id}`);
  };

  // Acción para eliminar el usuario, con confirmación previa
  const handleDelete = async () => {
    // Confirmación previa de eliminación
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: `Esta acción eliminará a "${user.userName || user.nombre || "este usuario"}" y no se podrá revertir.`,
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
        text: "El usuario no fue eliminado.",
      });
      return;
    }

    try {
      const index = usersData.findIndex((u) => u.id === user.id);
      if (index !== -1) usersData.splice(index, 1);
      // TODO: reemplazar por llamada real (ej. userService.delete(user.id))

      await Swal.fire({
        title: "¡Usuario eliminado!",
        text: "El usuario fue eliminado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 3000,
        timerProgressBar: true,
        customClass: {
            popup: "rounded-2x1",
            title: "text-green-600",  
            confirmButton: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 cursor-pointer rounded-lg",
            timerProgressBar: "!bg-green-600",
        },
        buttonsStyling: false,
      });

      onDeleted?.(user.id); // permite a la tabla padre refrescar su lista sin recargar la página
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