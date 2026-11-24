import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  ClipboardCheck,
  Truck,
  UtensilsCrossed,
  ClipboardList,
  Receipt,
  Coffee,
  Menu,
  ShieldCheck,
  Settings
} from "lucide-react";

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  ThemeSwitch
} from "@/shared";

import ImageThumb from "@/shared/components/ImageThumb";
import LogoutButton from "@/features/login/components/LogoutButton";
import { getSessionUser, SESSION_EVENT } from "@/services/apiClient";

// Módulos principales: barra superior desde md y menú hamburguesa por debajo de md
const NAV_LINKS = [
  { to: "/userList", label: "Usuarios", icon: User },
  { to: "/inventoryList", label: "Inventario", icon: ClipboardCheck },
  { to: "/providerList", label: "Proveedores", icon: Truck },
  { to: "/menuList", label: "Menú", icon: UtensilsCrossed },
  { to: "/ordensList", label: "Órdenes", icon: ClipboardList },
  { to: "/invoiceList", label: "Comprobantes", icon: Receipt },
];

// Usuario en sesión; se actualiza al iniciar sesión, al refrescar el token o al editar su foto
function useSessionUser() {
  const [user, setUser] = useState(getSessionUser);
  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, []);
  return user;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const sessionUser = useSessionUser();
  const displayName = sessionUser?.name || sessionUser?.email || "Usuario";

  return (
    <nav className="w-full bg-brand shadow-elevation-2 relative z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-2">

          <button
            onClick={() => navigate("/home")}
            className="flex items-center justify-center size-touch shrink-0 rounded-full text-text-on-brand hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Ir al home"
          >
            <Coffee className="w-8 h-8 stroke-[2.5]" />
          </button>

          {/* Escritorio (≥ md). En md se ocultan los iconos para que los 6 enlaces quepan en 768px */}
          <ul className="hidden md:flex items-center gap-3 lg:gap-5 min-w-0">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 min-h-touch whitespace-nowrap transition-colors duration-200 text-body font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                      isActive
                        ? "text-text-on-brand font-bold border-b-2 border-text-on-brand"
                        : "text-text-on-brand hover:text-text-on-brand/70"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 hidden lg:block" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center shrink-0">
            <Dropdown>
              <DropdownTrigger>
                {/* Avatar del usuario en sesión (foto o iniciales) + icono de menú */}
                <button
                  className="min-h-touch flex items-center gap-2 rounded-full pl-1 pr-3 text-text-on-brand hover:bg-brand-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer"
                  aria-label={`Abrir menú de ${displayName}`}
                >
                  <ImageThumb src={sessionUser?.imageThumb} alt="" name={displayName} size="sm" round />
                  <Menu className="w-6 h-6" aria-hidden="true" />
                </button>
              </DropdownTrigger>

              {/* max-w: en 360px el menú no se sale de la pantalla */}
              <DropdownContent className="right-0 w-64 max-w-[calc(100vw-2rem)]">
                {sessionUser && (
                  <div className="px-3 pb-2 mb-1 border-b border-border">
                    <p className="text-small font-heading text-text-primary truncate">{displayName}</p>
                    {sessionUser.name && sessionUser.email && (
                      <p className="text-caption text-text-secondary truncate">{sessionUser.email}</p>
                    )}
                  </div>
                )}

                {/* Módulos: solo por debajo de md (en escritorio están en la barra) */}
                <div className="md:hidden border-b border-border pb-1 mb-1">
                  {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                    const isActive = pathname === to || pathname.startsWith(`${to}/`);
                    return (
                      <DropdownItem
                        key={to}
                        onClick={() => navigate(to)}
                        className={isActive ? "bg-brand-soft font-bold" : ""}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                          <span className="font-body text-base">{label}</span>
                        </span>
                      </DropdownItem>
                    );
                  })}
                </div>

                <DropdownItem onClick={() => navigate("/permits")}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-body text-base">Permisos</span>
                  </div>
                </DropdownItem>

                <DropdownItem onClick={() => navigate("/settings")}>
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span className="font-body text-base">Configuración</span>
                  </div>
                </DropdownItem>

                {/* Fuera de DropdownItem a propósito: activar el switch no cierra el menú */}
                <ThemeSwitch />

                {/* Sin DropdownItem: era un <button> dentro de otro <button> (HTML inválido)
                    y sumaba el padding de ambos, desalineando el icono */}
                <LogoutButton role="menuitem" className="w-full min-h-touch px-3 text-left" />
              </DropdownContent>
            </Dropdown>
          </div>

        </div>
      </div>
    </nav>
  );
}
