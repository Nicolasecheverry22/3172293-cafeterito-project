// Iconos usados en los botones de acciones
import { Pencil, Trash2, Eye } from "lucide-react";

// Hook de React Router para navegar programáticamente entre rutas
import { useNavigate } from "react-router-dom";

// Alertas del design system (SweetAlert2)
import { showConfirmDeleteAlert, showSuccessAlert, showErrorAlert } from "@/shared/services/alertService";

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
    const result = await showConfirmDeleteAlert({
      title: "¿Eliminar usuario?",
      text: `Esta acción eliminará a "${user.userName}" y no se puede revertir.`,
    });

    if (!result.isConfirmed) return;

    try {
      const index = usersData.findIndex((u) => u.id === user.id);
      if (index !== -1) usersData.splice(index, 1);
      // TODO: reemplazar por llamada real (ej. userService.delete(user.id))

      await showSuccessAlert({
        title: "Usuario eliminado",
        text: "El usuario fue eliminado correctamente.",
        timer: 2000,
      });

      onDeleted?.(user.id); // permite a la tabla padre refrescar su lista sin recargar la página
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      await showErrorAlert({
        title: "Error al eliminar el usuario",
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
        className="p-1 rounded hover:bg-gray-100"
      >
        <Eye size={16} />
      </button>

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