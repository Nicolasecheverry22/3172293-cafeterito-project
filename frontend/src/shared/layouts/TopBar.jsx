// Barra superior (BEM: top-bar): título de la página o "Volver" en detalles y formularios,
// y menú de cuenta.
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "@/shared/components/Dropdown";
import ImageThumb from "@/shared/components/ImageThumb";
import LogoutButton from "@/features/login/components/LogoutButton";
import { useSessionUser } from "@/shared/hooks/usePermission";

export default function TopBar({ meta }) {
  const navigate = useNavigate();
  const user = useSessionUser();
  const displayName = user?.name || user?.email || "Usuario";

  return (
    <header className="top-bar">
      <div className="top-bar__start">
        {meta.back && (
          <button type="button" onClick={() => navigate(-1)} className="top-bar__back" aria-label="Volver a la página anterior">
            <ArrowLeft aria-hidden="true" />
            <span className="top-bar__back-label">Volver</span>
          </button>
        )}
        {/* <p> y no <h1>: cada página ya tiene su propio encabezado principal */}
        <p className="top-bar__title">{meta.title}</p>
      </div>

      <div className="top-bar__actions">
        <Dropdown>
          <DropdownTrigger>
            <button type="button" className="top-bar__account" aria-label={`Abrir menú de ${displayName}`}>
              <ImageThumb src={user?.imageThumb} alt="" name={displayName} size="sm" round />
            </button>
          </DropdownTrigger>
          <DropdownContent className="right-0 w-64 max-w-[calc(100vw-2rem)]">
            {user && (
              <div className="user-menu__header border-b border-border mb-1">
                <ImageThumb src={user.imageThumb} alt="" name={displayName} size="sm" round />
                <div className="user-menu__text">
                  <span className="user-menu__name">{displayName}</span>
                  {user.email && <span className="user-menu__roles">{user.email}</span>}
                  <span className="user-menu__roles">{user.groups?.length ? user.groups.join(" · ") : "Sin rol"}</span>
                </div>
              </div>
            )}
            <DropdownItem onClick={() => navigate("/profile")}>
              <span className="flex items-center gap-3">
                <UserCircle className="w-5 h-5" aria-hidden="true" />
                <span className="font-body text-base">Mi perfil</span>
              </span>
            </DropdownItem>
            <LogoutButton role="menuitem" className="w-full min-h-touch px-3 text-left" />
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}
