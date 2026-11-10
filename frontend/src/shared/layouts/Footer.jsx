import { Coffee, Mail, Activity, ShieldCheck } from "lucide-react";

const APP_VERSION = "1.0.0";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-border-strong bg-surface text-text-primary shadow-xs">
      <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-medium">
        
        {/* 1. Estado Operativo del Sistema (Alto contraste) */}
        <div className="flex items-center gap-2.5 text-text-primary">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            Sistema Online
          </span>
          <span className="text-border-strong font-bold" aria-hidden="true">|</span>
          <span className="flex items-center gap-1.5 text-text-primary">
            <Activity className="w-4 h-4 text-brand" aria-hidden="true" />
            <span>POS Sync Active</span>
          </span>
        </div>

        {/* 2. Identidad Minimalista y Copyright */}
        <div className="flex items-center gap-1.5 font-heading font-semibold text-text-primary">
          <Coffee className="w-4 h-4 text-brand" aria-hidden="true" />
          <span>Cafeterito Admin</span>
          <span className="text-text-primary font-normal">© {year}</span>
        </div>

        {/* 3. Soporte Técnico y Versión (Con contraste garantizado) */}
        <div className="flex items-center gap-3 text-text-primary">
          <a
            href="mailto:soporte@cafeterito.com"
            className="hover:text-brand transition-colors flex items-center gap-1.5 font-semibold"
          >
            <Mail className="w-4 h-4 text-text-primary" aria-hidden="true" />
            <span>Soporte Técnico</span>
          </a>
          <span className="text-border-strong font-bold" aria-hidden="true">|</span>
          <span className="font-mono text-[11px] bg-surface-muted border border-border-strong px-2 py-0.5 rounded text-text-primary font-bold shadow-2xs">
            v{APP_VERSION}
          </span>
        </div>

      </div>
    </footer>
  );
}