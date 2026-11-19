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
    <div className="row-actions">
      <button
        onClick={() => navigate(`/UserView/${user.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Visualizar usuario"
      >
        <Eye size={20} />
      </button>

      <button
        onClick={() => navigate(`/EditUser/${user.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Editar usuario"
      >
        <Pencil size={20} />
      </button>

      <button
        onClick={handleToggleStatus}
        className={`row-actions__btn touch-target hover:bg-surface-muted cursor-pointer ${
          isActive
            ? "text-success"
            : "text-error"
        }`}
        title={isActive ? "Activo — clic para deshabilitar" : "Inactivo — clic para habilitar"}
      >
        {isActive ? <Power size={20} /> : <PowerOff size={20} />}
      </button>
    </div>
  );
}
