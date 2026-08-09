import { NavLink, useNavigate } from "react-router-dom";
import { 
  User, 
  ClipboardCheck, 
  Truck, 
  UtensilsCrossed, 
  ClipboardList, 
  LogOut,
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

export default function Navbar() {
  const navigate = useNavigate();

  // const handleLogout = () => {
  //   setIsOpen(false);
  //   navigate("/auth");
  // };

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
                <span>Ordenes</span>
              </NavLink>
            </li>
          </ul>

          <div className="flex items-center">
            <Dropdown>
              <DropdownTrigger>
                <button
                  className="p-2 rounded-md text-text-primary hover:bg-brand-hover transition-colors flex items-center gap-2 focus:outline-none"
                  aria-label="Abrir Menú"
                >
                  <Menu className="w-7 h-7 " />
                </button>
              </DropdownTrigger>

              <DropdownContent className="right-0 mt-2 w-60 bg-white text-black border-gray-200 shadow-xl">

                <DropdownItem 
                  onClick={() => navigate("/permits")} 
                  className="hover:bg-gray-100 text-black focus:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-gray-600" />
                    <span>Permisos</span>
                  </div>
                </DropdownItem>

                <DropdownItem 
                  onClick={() => navigate("/auth")} 
                  className="hover:bg-red-50 text-red-600 focus:bg-red-50 font-serif"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </div>
                </DropdownItem>
                
              </DropdownContent>
            </Dropdown>
          </div>

        </div>
      </div>
    </nav>
  );
}