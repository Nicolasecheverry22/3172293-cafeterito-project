import { Coffee, Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/home", label: "Inicio" },
  { to: "/inventoryList", label: "Inventario" },
  { to: "/menuList", label: "Menú" },
  { to: "/ordensList", label: "Órdenes" },
  { to: "/userList", label: "Usuarios" },
  { to: "/providerList", label: "Proveedores" },
];

const APP_VERSION = "1.0.0";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-white/10 bg-[var(--semantic-surface-inverse)] text-text-inverse">
      <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Identidad de Marca y Ficha */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-heading font-semibold text-white">
            <Coffee className="w-4 h-4 text-brand" />
            <span>Cafeterito</span>
          </div>
          <span className="text-white/20">|</span>
          <p className="text-text-inverse/60 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Todos los derechos reservados
          </p>
        </div>

        {/* Navegación Enlinea */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-text-inverse/70 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright, Contacto y Versión */}
        <div className="flex items-center gap-3 text-text-inverse/60">
          <a
            href="mailto:soporte@cafeterito.com"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Soporte</span>
          </a>
          <span className="text-white/20">|</span>
          <span>© {year}</span>
          <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/80">
            v{APP_VERSION}
          </span>
        </div>

      </div>
    </footer>
  );
}