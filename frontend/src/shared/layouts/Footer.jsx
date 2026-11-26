import { useState, useEffect } from "react";
import {
  Coffee,
  Activity,
  Copy,
  Check,
  ExternalLink,
  Mail,
  X,
  Headset,
} from "lucide-react";
import DataPolicyLink from "@/shared/components/DataPolicyLink";

const APP_VERSION = "1.0.0";

const SUPPORT_EMAILS = [
  { id: "nicolas", email: "nicolasecheverry52@gmail.com" },
  { id: "miguel", email: "miguelangelmarincardona383@gmail.com" },
  { id: "messi", email: "messiocampo8@gmail.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [openSupport, setOpenSupport] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(SUPPORT_EMAILS[0].email);
  const [copiedEmail, setCopiedEmail] = useState(null);

  useEffect(() => {
    if (!openSupport) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenSupport(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSupport]);

  const handleCopyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => {
        setCopiedEmail((prev) => (prev === email ? null : prev));
      }, 2200);
    } catch {
      // Sin acción si el portapapeles no está disponible
    }
  };

  const subject = `Soporte Técnico - Cafeterito Admin v${APP_VERSION}`;
  const body = `Hola equipo de soporte,\n\nNecesito ayuda con Cafeterito Admin (v${APP_VERSION}):\n\n`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    selectedEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const mailtoUrl = `mailto:${selectedEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <>
      <footer className="w-full mt-auto border-t border-border-strong bg-surface text-text-primary shadow-elevation-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center justify-center gap-2 text-text-primary">
            <span className="flex items-center gap-2 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              Sistema Online
            </span>
            <span className="text-border-strong font-bold" aria-hidden="true">
              |
            </span>
            <span className="flex items-center gap-1 text-text-primary">
              <Activity
                className="w-4 h-4 text-text-primary dark:text-brand"
                aria-hidden="true"
              />
              <span>POS Sync Active</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 font-heading font-semibold text-text-primary">
            <Coffee
              className="w-4 h-4 text-text-primary dark:text-brand"
              aria-hidden="true"
            />
            <span>Cafeterito Admin</span>
            <span className="text-text-primary font-normal">© {year}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-text-primary">
            <button
              type="button"
              onClick={() => setOpenSupport(true)}
              aria-haspopup="dialog"
              aria-expanded={openSupport}
              className="group relative inline-flex items-center gap-1.5 min-h-touch px-3.5 py-1.5 rounded-shape-full font-semibold tracking-[-0.01em] text-text-primary bg-surface-muted border border-border hover:border-border-strong hover:shadow-elevation-1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-brand opacity-0 group-hover:opacity-[0.14] group-active:opacity-[0.22] transition-opacity duration-200"
              />
              <Headset
                className="w-4 h-4 text-text-primary dark:text-brand transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:-rotate-12 group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="relative">Soporte Técnico</span>
            </button>

            <span className="text-border-strong font-bold" aria-hidden="true">
              |
            </span>

            <DataPolicyLink className="inline-flex items-center min-h-touch">
              Política de tratamiento de datos
            </DataPolicyLink>

            <span className="text-border-strong font-bold" aria-hidden="true">
              |
            </span>

            <span className="font-mono text-caption bg-surface-muted border border-border-strong px-2 py-0.5 rounded-shape-xs text-text-primary font-bold tabular-nums">
              v{APP_VERSION}
            </span>
          </div>
        </div>
      </footer>

      {openSupport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setOpenSupport(false)}
        >
          <div
            className="w-full max-w-md rounded-shape-xl bg-surface border border-border-strong text-text-primary shadow-elevation-3 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-brand" aria-hidden="true" />

            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-shape-full bg-surface-muted border border-border-strong text-text-primary dark:text-brand">
                    <Headset className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="support-modal-title"
                      className="font-heading text-base font-bold tracking-[-0.02em] text-text-primary"
                    >
                      Soporte Técnico
                    </h2>
                    <p className="text-xs text-text-secondary tracking-[-0.01em] truncate">
                      Elige un correo para enviar tu mensaje
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenSupport(false)}
                  aria-label="Cerrar ventana de soporte técnico"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-shape-full bg-surface-muted border border-border text-text-primary hover:bg-red-500/15 hover:text-red-500 hover:border-red-500/60 hover:shadow-elevation-1 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                role="radiogroup"
                aria-label="Seleccionar correo de soporte técnico"
                className="space-y-2.5"
              >
                {SUPPORT_EMAILS.map((item) => {
                  const isSelected = selectedEmail === item.email;
                  const isCopied = copiedEmail === item.email;

                  return (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedEmail(item.email)}
                        className={`group relative flex-1 min-w-0 min-h-touch flex items-center justify-center px-4 py-2 rounded-shape-full border text-center font-medium transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
                          isSelected
                            ? "scale-[0.97] translate-y-[1px] bg-brand text-text-on-brand border-border-strong shadow-inner"
                            : "scale-100 translate-y-0 bg-surface-muted text-text-primary border-border hover:border-border-strong hover:shadow-elevation-1 active:scale-[0.95]"
                        }`}
                      >
                        {!isSelected && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-brand opacity-0 group-hover:opacity-[0.12] transition-opacity duration-150"
                          />
                        )}

                        <span className="relative font-heading font-medium text-xs sm:text-[13px] tracking-[-0.02em] truncate">
                          {item.email}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyEmail(item.email)}
                        aria-label={
                          isCopied
                            ? `Correo ${item.email} copiado`
                            : `Copiar correo ${item.email}`
                        }
                        title={isCopied ? "Copiado" : "Copiar correo"}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-shape-full border transition-all duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
                          isCopied
                            ? "bg-success-container text-success border-success shadow-elevation-1"
                            : "bg-surface-muted text-success border-success/60 hover:bg-success-container/60 hover:border-success"
                        }`}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 stroke-[2.75]" aria-hidden="true" />
                        ) : (
                          <Copy className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-2 min-h-touch px-4 py-2 rounded-shape-full text-xs font-bold tracking-[-0.01em] bg-brand text-text-on-brand border border-border-strong shadow-elevation-1 hover:shadow-elevation-2 active:scale-[0.98] transition-all overflow-hidden"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.08] transition-opacity"
                  />
                  <span className="relative">Abrir en Gmail Web</span>
                  <ExternalLink className="relative w-3.5 h-3.5" aria-hidden="true" />
                </a>

                <a
                  href={mailtoUrl}
                  className="group relative inline-flex items-center justify-center gap-2 min-h-touch px-4 py-2 rounded-shape-full text-xs font-semibold tracking-[-0.01em] bg-surface-muted text-text-primary border border-border hover:border-border-strong hover:shadow-elevation-1 active:scale-[0.98] transition-all overflow-hidden"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-brand opacity-0 group-hover:opacity-[0.12] transition-opacity"
                  />
                  <Mail className="relative w-3.5 h-3.5" aria-hidden="true" />
                  <span className="relative">App de Correo PC</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}