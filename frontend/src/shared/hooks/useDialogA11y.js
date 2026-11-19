// src/shared/hooks/useDialogA11y.js
// Accesibilidad de teclado para modales (WAI-ARIA "dialog modal"):
//  - Escape cierra el modal.
//  - Al abrir, el foco entra en el modal (primer elemento enfocable).
//  - Tab / Shift+Tab quedan atrapados dentro del modal.
//  - Al cerrar, el foco vuelve al elemento que lo abrió.
// Uso: const dialogRef = useDialogA11y(isOpen, onClose); <div ref={dialogRef} role="dialog" ...>
import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

// Mientras hay una alerta de SweetAlert abierta encima, ella gestiona el teclado
const isSweetAlertOpen = () => Boolean(document.querySelector(".swal2-container"));

export default function useDialogA11y(isOpen, onClose) {
  const dialogRef = useRef(null);

  // Siempre la versión actual de onClose, sin re-registrar los listeners
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;

    const getFocusable = () =>
      dialog ? Array.from(dialog.querySelectorAll(FOCUSABLE)) : [];

    // Foco inicial dentro del modal
    const [first] = getFocusable();
    (first ?? dialog)?.focus();

    const handleKeyDown = (e) => {
      if (isSweetAlertOpen()) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (e.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      } else if (!dialog.contains(document.activeElement)) {
        // El foco se escapó (p. ej. clic fuera): se devuelve al modal
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Devuelve el foco al disparador si sigue en el documento
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  return dialogRef;
}
