// Barra superior (BEM: top-bar), 64px, superficie sólida y sombra al hacer scroll.
//  - Izquierda: botón de menú en móvil (abre el drawer); en detalles y formularios,
//    "Volver" + breadcrumb ("Órdenes › Orden #45"); en el resto, el título de la página.
//  - Derecha: modo claro/oscuro y menú de cuenta (perfil y cierre de sesión).
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Menu, Moon, Sun, UserCircle } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "@/shared/components/Dropdown";
import ImageThumb from "@/shared/components/ImageThumb";
import LogoutButton from "@/features/login/components/LogoutButton";
import { useSessionUser } from "@/shared/hooks/usePermission";
import useTheme from "@/shared/theme/useTheme";

const isScrolled = () => window.scrollY > 0;

export default function TopBar({ meta, onOpenMenu, menuOpen = false, menuButtonRef }) {
  const navigate = useNavigate();
  const user = useSessionUser();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const displayName = user?.name || user?.email || "Usuario";
  const [scrolled, setScrolled] = useState(isScrolled);

  useEffect(() => {
    const onScroll = () => setScrolled(isScrolled());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Como el antiguo FormNavbar: vuelve a la página anterior. Si se entró directo por URL
  // (no hay historial dentro de la app), va al listado del módulo.
  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(meta.item?.to ?? "/home");
  };

  return (
    <header className={`top-bar ${scrolled ? "top-bar--scrolled" : ""}`}>
      <div className="top-bar__start">
        {onOpenMenu && (
          <button
            ref={menuButtonRef}
            type="button"
            onClick={onOpenMenu}
            className="top-bar__icon-button top-bar__menu"
            aria-label="Abrir menú de navegación"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <Menu aria-hidden="true" />
          </button>
        )}

        {meta.back ? (
          <>
            <button type="button" onClick={goBack} className="top-bar__back" aria-label="Volver a la página anterior">
              <ArrowLeft aria-hidden="true" />
              <span className="top-bar__back-label">Volver</span>
            </button>
            <nav aria-label="Ruta de navegación" className="top-bar__breadcrumb">
              <ol>
                {meta.item && (
                  <li className="top-bar__crumb top-bar__crumb--parent">
                    <Link to={meta.item.to}>{meta.item.label}</Link>
                    <ChevronRight className="top-bar__crumb-separator" aria-hidden="true" />
                  </li>
                )}
                <li className="top-bar__crumb top-bar__title" aria-current="page">{meta.title}</li>
              </ol>
            </nav>
          </>
        ) : (
          // <p> y no <h1>: cada página ya tiene su propio encabezado principal
          <p className="top-bar__title">{meta.title}</p>
        )}
      </div>

      <div className="top-bar__actions">
        <button
          type="button"
          onClick={toggleTheme}
          className="top-bar__icon-button"
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>

        <Dropdown>
          <DropdownTrigger>
            <button type="button" className="top-bar__account" aria-label={`Abrir menú de ${displayName}`}>
              <ImageThumb src={user?.imageThumb} alt="" name={displayName} size="sm" round />
            </button>
          </DropdownTrigger>
          {/* max-w: en 360px el menú no se sale de la pantalla */}
          <DropdownContent className="right-0 w-72 max-w-[calc(100vw-2rem)]">
            {user && (
              <div className="user-menu__header border-b border-border mb-1">
                <ImageThumb src={user.imageThumb} alt="" name={displayName} size="sm" round />
                <div className="user-menu__text">
                  <span className="user-menu__name">{displayName}</span>
                  {user.email && <span className="user-menu__roles">{user.email}</span>}
                  <span className="user-menu__roles">
                    {user.groups?.length ? user.groups.join(" · ") : "Sin rol"}
                  </span>
                </div>
              </div>
            )}
            <DropdownItem
              onClick={() => navigate("/profile")}
              aria-current={meta.title === "Mi perfil" ? "page" : undefined}
            >
              <span className="flex items-center gap-3">
                <UserCircle className="w-5 h-5" aria-hidden="true" />
                <span className="font-body text-base">Mi perfil</span>
              </span>
            </DropdownItem>
            {/* Fuera de DropdownItem: sería un <button> dentro de otro (HTML inválido) */}
            <LogoutButton role="menuitem" className="w-full min-h-touch px-3 text-left" />
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}
