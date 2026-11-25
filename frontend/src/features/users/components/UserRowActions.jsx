import { Pencil, Eye, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared";
import { confirmAction } from "@/shared/services/confirmAction";
import { setUserStatus } from "@/services/userApi";
import usePermission from "@/shared/hooks/usePermission";

// Acciones por fila. No existe "Eliminar": el usuario se habilita/deshabilita (RFADMIN05).
export default function UserRowActions({ user, onChanged }) {
  const { guard } = usePermission();
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
      <Button
        variant="info"
        size="xs"
        shape="pill"
        onClick={() => navigate(`/UserView/${user.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Visualizar usuario"
        aria-label={`Visualizar usuario ${name}`}
        {...guard("view_user", "ver el detalle de usuarios")}
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant="edit"
        size="xs"
        shape="pill"
        onClick={() => navigate(`/EditUser/${user.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Editar usuario"
        aria-label={`Editar usuario ${name}`}
        {...guard("update_user", "editar usuarios")}
      >
        <Pencil className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant={isActive ? "enable" : "disable"}
        size="xs"
        shape="pill"
        onClick={handleToggleStatus}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title={isActive ? "Activo — clic para deshabilitar" : "Inactivo — clic para habilitar"}
        aria-label={isActive ? `Deshabilitar usuario ${name}` : `Habilitar usuario ${name}`}
        {...guard("disable_user", "cambiar el estado de usuarios")}
      >
        {isActive ? <Power className="w-5 h-5" aria-hidden="true" /> : <PowerOff className="w-5 h-5" aria-hidden="true" />}
      </Button>
    </div>
  );
}