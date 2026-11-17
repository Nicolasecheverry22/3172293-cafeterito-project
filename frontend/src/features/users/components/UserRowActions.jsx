import { Pencil, Eye, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { confirmAction } from "@/shared/services/confirmAction";
import { setUserStatus } from "@/services/userApi";

// Acciones por fila. No existe "Eliminar": el usuario se habilita/deshabilita (RFADMIN05).
export default function UserRowActions({ user, onChanged }) {
  const navigate = useNavigate();
  const isActive = user.is_active ?? user.isActive ?? true;
  const name = user.userName || user.nombre || "este usuario";

  const handleToggleStatus = () =>
    confirmAction({
      title: isActive ? "¿Deshabilitar usuario?" : "¿Habilitar usuario?",
      text: isActive
        ? `"${name}" no podrá iniciar sesión hasta que se habilite de nuevo.`
        : `"${name}" podrá volver a iniciar sesión (también se levanta un bloqueo por intentos fallidos).`,
      confirmText: isActive ? "Sí, deshabilitar" : "Sí, habilitar",
      action: () => setUserStatus(user.id, !isActive),
      successTitle: isActive ? "Usuario deshabilitado" : "Usuario habilitado",
      successText: "El estado del usuario se actualizó correctamente.",
      onDone: onChanged,
    });

  return (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/UserView/${user.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Visualizar usuario"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={() => navigate(`/EditUser/${user.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Editar usuario"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleToggleStatus}
        className={`p-1 rounded hover:bg-surface-muted cursor-pointer ${
          isActive
            ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        }`}
        title={isActive ? "Deshabilitar usuario" : "Habilitar usuario"}
      >
        {isActive ? <PowerOff size={16} /> : <Power size={16} />}
      </button>
    </div>
  );
}
