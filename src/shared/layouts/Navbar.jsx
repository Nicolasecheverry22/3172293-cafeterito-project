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
  DropdownItem 
} from "@/shared"; 

import LogoutButton from "@/features/login/components/LogoutButton";

export default function Navbar() {
  const navigate = useNavigate();



  return (
    <nav className="w-full bg-brand shadow-md relative z-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          
          <button 
            onClick={() => navigate("/home")}
            className="flex items-center text-text-primary hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
            aria-label="Ir al home"
          >
            <Coffee className="w-8 h-8 stroke-[2.5]" />
          </button>

          <ul className="hidden md:flex items-center gap-6">
            <li>
              <NavLink
                to="/userList"
                className={({ isActive }) =>
                  `flex items-center gap-2 transition-colors duration-200 text-body font-body ${
                    isActive 
                      ? "text-black font-bold border-b-2 border-black" 
                      : "text-text-primary hover:text-black/70"
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
                  `flex items-center gap-2 transition-colors duration-200 text-body font-body ${
                    isActive 
                      ? "text-black font-bold border-b-2 border-black" 
                      : "text-text-primary hover:text-black/70"
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
                  `flex items-center gap-2 transition-colors duration-200 text-body font-body ${
                    isActive 
                      ? "text-black font-bold border-b-2 border-black" 
                      : "text-text-primary hover:text-black/70"
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
                  `flex items-center gap-2 transition-colors duration-200 text-body font-body ${
                    isActive 
                      ? "text-black font-bold border-b-2 border-black" 
                      : "text-text-primary hover:text-black/70"
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
                  `flex items-center gap-2 transition-colors duration-200 text-body font-body ${
                    isActive 
                      ? "text-black font-bold border-b-2 border-black" 
                      : "text-text-primary hover:text-black/70"
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
                <button
                  className="p-2 rounded-md text-text-primary hover:bg-brand-hover transition-colors flex items-center gap-2 focus:outline-none cursor-pointer"
                  aria-label="Abrir Menú"
                >
                  <Menu className="w-7 h-7" />
                </button>
              </DropdownTrigger>

              <DropdownContent className="right-0 w-52">

                <DropdownItem onClick={() => navigate("/permits")}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-medium font-body text-base">Permisos</span>
                  </div>
                </DropdownItem>

                <DropdownItem className="mt-1 p-0">
                  <LogoutButton className="w-full px-3 py-2" />
                </DropdownItem>
                
              </DropdownContent>
            </Dropdown>
          </div>

        </div>
      </div>
    </nav>
  );
}