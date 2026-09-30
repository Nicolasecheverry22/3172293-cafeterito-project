import { Coffee, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/home", label: "Inicio" },
  { to: "/userList", label: "Usuarios" },
  { to: "/providerList", label: "Proveedores" },
  { to: "/inventoryList", label: "Inventario" },
  { to: "/menuList", label: "Menú" },
  { to: "/ordensList", label: "Órdenes" },
];

const APP_VERSION = "1.0.0";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto">
      <div className="h-1 w-full bg-brand" />

      <div className="bg-[var(--semantic-surface-inverse)]">
        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-text-inverse">
              <Coffee className="w-6 h-6 stroke-[2.5]" />
              <span className="font-heading font-bold text-body">Cafeterito</span>
            </div>
            <p className="text-small text-text-inverse/70 max-w-xs">
              Sistema de gestión para el día a día del restaurante: usuarios, inventario, proveedores, menú y órdenes en un solo lugar.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-small text-text-inverse">Navegación</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-small text-text-inverse/70 hover:text-text-inverse transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-bold text-small text-text-inverse">Soporte</h3>
            <a
              href="mailto:soporte@cafeterito.com"
              className="flex items-center gap-2 text-small text-text-inverse/70 hover:text-text-inverse transition-colors"
            >
              <Mail className="w-4 h-4" />
              soporte@cafeterito.com
            </a>
            <p className="text-caption text-text-inverse/50">
              Sistema desarrollado por el equipo Cafeterito — SENA, ficha 3172293.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-caption text-text-inverse/60">
              © {year} Cafeterito. Todos los derechos reservados.
            </p>
            <p className="text-caption text-text-inverse/40">v{APP_VERSION}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}