// Acción confirmada (habilitar/inhabilitar, anular): confirma → ejecuta → informa.
// Reemplaza a los antiguos "Eliminar": el backend ya no permite borrado físico.
import {
  showConfirmAlert,
  showSuccessAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";

/**
 * @param {object} opts
 * @param {string} opts.title          Título de la confirmación
 * @param {string} opts.text           Texto de la confirmación
 * @param {string} opts.confirmText    Texto del botón de confirmar
 * @param {"danger"|"warning"|"info"} [opts.variant] Variante de la confirmación (por defecto danger)
 * @param {() => Promise} opts.action  Llamada al API
 * @param {string} opts.successTitle   Título del mensaje de éxito
 * @param {string} opts.successText    Texto del mensaje de éxito
 * @param {() => void} [opts.onDone]   Callback tras el éxito (p. ej. recargar la tabla)
 */
export async function confirmAction({
  title,
  text,
  confirmText,
  variant = "danger",
  action,
  successTitle,
  successText,
  onDone,
}) {
  const result = await showConfirmAlert({
    title,
    text,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    variant,
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

// Compara el estado actual de un formulario con su estado inicial. Los archivos (File)
// se comparan por nombre/tamaño; el resto por valor (JSON).
const normalize = (value) =>
  JSON.stringify(value, (_key, v) =>
    typeof File !== "undefined" && v instanceof File ? `file:${v.name}:${v.size}` : v
  );

export const isFormDirty = (current, initial) =>
  current != null && initial != null && normalize(current) !== normalize(initial);

/**
 * Salir de un formulario (Cancelar). Si no hay cambios sale sin preguntar; si los hay,
 * pide confirmación "warning". Devuelve true si se puede salir.
 */
export async function confirmDiscardChanges({
  isDirty,
  title = "¿Descartar los cambios?",
  text = "Los cambios que hiciste no se guardarán.",
  confirmButtonText = "Sí, descartar",
  cancelButtonText = "Seguir editando",
} = {}) {
  if (!isDirty) return true;
  const { isConfirmed } = await showConfirmAlert({
    title,
    text,
    confirmButtonText,
    cancelButtonText,
    variant: "warning",
  });
  return isConfirmed;
}
