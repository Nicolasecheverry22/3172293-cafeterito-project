import { Coffee, Mail, Activity } from "lucide-react";

const APP_VERSION = "1.0.0";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-border-strong bg-surface text-text-primary shadow-elevation-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-xs font-medium">

        {/* 1. Estado Operativo del Sistema (Alto contraste) */}
        <div className="flex items-center gap-2 text-text-primary">
          <span className="flex items-center gap-2 font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            Sistema Online
          </span>
          <span className="text-border-strong font-bold" aria-hidden="true">|</span>
          <span className="flex items-center gap-1 text-text-primary">
            {/* El amarillo sobre surface claro da ~2.5:1: solo se usa en oscuro */}
            <Activity className="w-4 h-4 text-text-primary dark:text-brand" aria-hidden="true" />
            <span>POS Sync Active</span>
          </span>
        </div>

        {/* 2. Identidad Minimalista y Copyright */}
        <div className="flex items-center gap-1 font-heading font-semibold text-text-primary">
          <Coffee className="w-4 h-4 text-text-primary dark:text-brand" aria-hidden="true" />
          <span>Cafeterito Admin</span>
          <span className="text-text-primary font-normal">© {year}</span>
        </div>

        {/* 3. Soporte Técnico y Versión (Con contraste garantizado) */}
        <div className="flex items-center gap-3 text-text-primary">
          <a
            href="mailto:soporte@cafeterito.com"
            className="min-h-touch hover:underline transition-colors flex items-center gap-1 font-semibold"
          >
            <Mail className="w-4 h-4 text-text-primary" aria-hidden="true" />
            <span>Soporte Técnico</span>
          </a>
          <span className="text-border-strong font-bold" aria-hidden="true">|</span>
          <span className="font-mono text-caption bg-surface-muted border border-border-strong px-2 py-0.5 rounded-shape-xs text-text-primary font-bold">
            v{APP_VERSION}
          </span>
        </div>

      </div>
    </footer>
  );
}