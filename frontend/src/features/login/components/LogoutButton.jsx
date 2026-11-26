import { LogOut } from "lucide-react";
import { showConfirmAlert } from "@/shared/services/alertService";
import { logout } from "@/features/login/services/logoutService";

export default function LogoutButton({ className = "", showLabel = true, ...props }) {

  const handleLogout = async () => {
    const result = await showConfirmAlert({
      title: "¿Cerrar sesión?",
      text: "Tendrás que iniciar sesión nuevamente para acceder al sistema.",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      variant: "info",
    });

    if (!result.isConfirmed) return;

    logout();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`flex items-center gap-3 text-error hover:bg-error/10 transition-colors cursor-pointer focus:outline-none focus-visible:bg-error/10 ${className}`}
      {...props}
    >
      <LogOut className="w-5 h-5" />
      {showLabel && <span className="font-medium font-body text-body">Cerrar Sesión</span>}
    </button>
  );
}