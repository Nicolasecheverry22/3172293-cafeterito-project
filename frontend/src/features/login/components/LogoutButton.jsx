import { LogOut } from "lucide-react";
import { showConfirmDeleteAlert } from "@/shared/services/alertService";
import { logout } from "@/features/login/services/logoutService";

export default function LogoutButton({ className = "", showLabel = true }) {

  const handleLogout = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Cerrar sesión?",
      text: "Tendrás que iniciar sesión nuevamente para acceder al sistema.",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    logout();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`flex items-center gap-3 text-error hover:bg-error/10 transition-colors cursor-pointer ${className}`}
    >
      <LogOut className="w-5 h-5" />
      {showLabel && <span className="font-medium font-body text-body">Cerrar Sesión</span>}
    </button>
  );
}