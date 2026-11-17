// Acción confirmada (habilitar/inhabilitar, anular): confirma → ejecuta → informa.
// Reemplaza a los antiguos "Eliminar": el backend ya no permite borrado físico.
import {
  showConfirmDeleteAlert,
  showSuccessAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";

/**
 * @param {object} opts
 * @param {string} opts.title          Título de la confirmación
 * @param {string} opts.text           Texto de la confirmación
 * @param {string} opts.confirmText    Texto del botón de confirmar
 * @param {() => Promise} opts.action  Llamada al API
 * @param {string} opts.successTitle   Título del mensaje de éxito
 * @param {string} opts.successText    Texto del mensaje de éxito
 * @param {() => void} [opts.onDone]   Callback tras el éxito (p. ej. recargar la tabla)
 */
export async function confirmAction({
  title,
  text,
  confirmText,
  action,
  successTitle,
  successText,
  onDone,
}) {
  const result = await showConfirmDeleteAlert({
    title,
    text,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
  });
  if (!result.isConfirmed) return false;

  try {
    await action();
    await showSuccessAlert({ title: successTitle, text: successText });
    onDone?.();
    return true;
  } catch (error) {
    // El backend explica el motivo (p. ej. 409: platillo en una orden abierta)
    await showSystemErrorAlert({
      text: error.message || "La operación no se pudo completar. Intenta nuevamente.",
    });
    return false;
  }
}
