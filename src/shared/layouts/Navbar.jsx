import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  User, 
  ClipboardCheck, 
  Truck, 
  UtensilsCrossed, 
  ClipboardList, 
  LogOut
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

 
  const menuItems = [
    { label: "Usuarios", to: "/dashboard/userList", icon: User },
    { label: "Inventario", to: "/dashboard/inventario/crear", icon: ClipboardCheck },
    { label: "Proveedores", to: "/dashboard/proveedores/crear", icon: Truck },
    { label: "Menú", to: "/dashboard/menu", icon: UtensilsCrossed },
    { label: "Ordenes", to: "/dashboard/ordenes", icon: ClipboardList },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    navigate("/auth/login");
  };

  return (
    <header className="bg-brand w-full px-6 py-3 flex items-center justify-end shadow-md relative z-50">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-2 rounded-md text-text-primary hover:bg-brand-hover transition-colors flex items-center gap-2 focus:outline-none"
          aria-expanded={isOpen}
          aria-label="Abrir Menú"
        >
          <LayoutGrid className="w-8 h-8 stroke-[2.5]" />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
            <div className="h-6 w-full bg-gradient-to-b from-black/20 via-black/5 to-transparent" />

            <nav className="flex flex-col py-2 px-4 gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-serif text-black hover:bg-gray-100 transition-colors ${
                        isActive ? "font-bold bg-gray-100" : ""
                      }`
                    }
                  >
                    <Icon className="w-6 h-6 stroke-[2]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <div className="my-2 border-t border-gray-200" />

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-serif text-black hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left focus:outline-none"
              >
                <LogOut className="w-6 h-6 stroke-[2]" />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
            <div className="h-8 w-full bg-gradient-to-t from-black/25 via-black/10 to-transparent" />
          </div>
        )}
      </div>

    </header>
  );
}