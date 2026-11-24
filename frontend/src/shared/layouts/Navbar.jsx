import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  User, 
  ClipboardCheck, 
  Truck, 
  UtensilsCrossed, 
  ClipboardList, 
  Coffee,
  Menu,
  ShieldCheck 
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
  const sessionUser = useSessionUser();

  return (
    <nav className="w-full bg-brand shadow-elevation-2 relative z-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          
          <button 
            onClick={() => navigate("/home")}
            className="flex items-center justify-center size-touch rounded-full text-text-on-brand hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Ir al home"
          >
            <Coffee className="w-8 h-8 stroke-[2.5]" />
          </button>

          <ul className="hidden md:flex items-center gap-6">
            <li>
              <NavLink
                to="/userList"
                className={({ isActive }) =>
                  `flex items-center gap-2 min-h-touch transition-colors duration-200 text-body font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isActive 
                      ? "text-text-on-brand font-bold border-b-2 border-text-on-brand" 
                      : "text-text-on-brand hover:text-text-on-brand/70"
                  }`
                }
              >
                <User className="w-5 h-5 " />
                <span>Usuarios</span>
              </NavLink>
            </li>
            
            <li>
              <NavLink
                to="/inventoryList"
                className={({ isActive }) =>
                  `flex items-center gap-2 min-h-touch transition-colors duration-200 text-body font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isActive 
                      ? "text-text-on-brand font-bold border-b-2 border-text-on-brand" 
                      : "text-text-on-brand hover:text-text-on-brand/70"
                  }`
                }
              >
                <ClipboardCheck className="w-5 h-5 " />
                <span>Inventario</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/providerList"
                className={({ isActive }) =>
                  `flex items-center gap-2 min-h-touch transition-colors duration-200 text-body font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isActive 
                      ? "text-text-on-brand font-bold border-b-2 border-text-on-brand" 
                      : "text-text-on-brand hover:text-text-on-brand/70"
                  }`
                }
              >
                <Truck className="w-5 h-5" />
                <span>Proveedores</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/menuList"
                className={({ isActive }) =>
                  `flex items-center gap-2 min-h-touch transition-colors duration-200 text-body font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isActive 
                      ? "text-text-on-brand font-bold border-b-2 border-text-on-brand" 
                      : "text-text-on-brand hover:text-text-on-brand/70"
                  }`
                }
              >
                <UtensilsCrossed className="w-5 h-5 " />
                <span>Menú</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/ordensList"
                className={({ isActive }) =>
                  `flex items-center gap-2 min-h-touch transition-colors duration-200 text-body font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                    isActive 
                      ? "text-text-on-brand font-bold border-b-2 border-text-on-brand" 
                      : "text-text-on-brand hover:text-text-on-brand/70"
                  }`
                }
              >
                <ClipboardList className="w-5 h-5" />
                <span>Órdenes</span>
              </NavLink>
            </li>
          </ul>

  <div className="flex items-center">
            <Dropdown>
              <DropdownTrigger>
                {/* Avatar del usuario en sesión (foto o iniciales) + icono de menú */}
                <button
                  className="min-h-touch flex items-center gap-2 rounded-full pl-1 pr-3 text-text-on-brand hover:bg-brand-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer"
                  aria-label={`Abrir menú${sessionUser?.name ? ` de ${sessionUser.name}` : ""}`}
                >
                  <ImageThumb
                    src={sessionUser?.imageThumb}
                    alt=""
                    name={sessionUser?.name || sessionUser?.email || "Usuario"}
                    size="sm"
                    round
                  />
                  <Menu className="w-6 h-6" aria-hidden="true" />
                </button>
              </DropdownTrigger>

              {/* w-64: "Modo oscuro" + switch caben en una línea. Sin márgenes extra en los
                  ítems: todos los iconos alineados a 12px (padding de ítem de menú M3) */}
              <DropdownContent className="right-0 w-64">

                <DropdownItem onClick={() => navigate("/permits")}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-medium font-body text-base">Permisos</span>
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