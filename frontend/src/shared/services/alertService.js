// src/shared/services/alertService.js

import Swal from "sweetalert2";

// Alerta de "sin permiso" (403) abierta: la muestra apiClient. Mientras esté visible, las
// alertas de error genéricas que muestre el llamador en su catch no la reemplazan.
let forbiddenAlert = null;

/**
 * 0. Sin permiso (403 de la API). No cierra la sesión.
 */
export function showForbiddenAlert(text = "No tienes permiso para realizar esta acción") {
  if (forbiddenAlert) return forbiddenAlert;
  forbiddenAlert = Swal.fire({
    title: "Acción no permitida",
    text,
    icon: "info",
    confirmButtonText: "Entendido",
    customClass: {
      popup: "!rounded-shape-xl",
      title: "!text-info font-bold",
      confirmButton:
        "!bg-info hover:!bg-info/90 !text-on-info cursor-pointer px-4 py-2 rounded-md font-medium",
    },
    buttonsStyling: false,
  }).finally(() => {
    forbiddenAlert = null;
  });
  return forbiddenAlert;
}

/**
 * 1. Error al crear (usuario, proveedor, producto, etc.)
 * Se dispara al presionar crear si falta un campo o falla la validación del schema.
 */
export const showCreateErrorAlert = async ({
  entity = "",
  title = "Campos incompletos",
  text,
} = {}) => {
  if (forbiddenAlert) return forbiddenAlert;
  return await Swal.fire({
    title,
    text: text || `Por favor completa los campos requeridos para el ${entity}.`,
    icon: "warning",
    confirmButtonText: "Entendido",
    customClass: {
      popup: "!rounded-shape-xl",
      confirmButton:
        "!bg-warning hover:!bg-warning/90 !text-on-warning px-4 py-2 rounded-md font-medium cursor-pointer",
    },
    buttonsStyling: false,
  });
}

/**
 * Estilos por variante de confirmación. Los colores salen de los tokens semánticos,
 * así que siguen al tema (claro/oscuro) sin reglas extra.
 *  - danger:  destructiva o irreversible (quitar, vaciar, anular, deshabilitar).
 *  - warning: salir con cambios sin guardar, cancelar un formulario.
 *  - info:    confirmación neutra (cerrar sesión, generar reporte, habilitar).
 */
const CONFIRM_VARIANTS = {
  danger: {
    icon: "warning",
    iconColor: "var(--semantic-error)",
    title: "!text-error font-bold",
    confirmButton: "!bg-error hover:!bg-error/90 !text-on-error",
    focusCancel: true,
  },
  warning: {
    icon: "warning",
    iconColor: "var(--semantic-warning)",
    title: "!text-warning font-bold",
    confirmButton: "!bg-warning hover:!bg-warning/90 !text-on-warning",
    focusCancel: false,
  },
  info: {
    icon: "question",
    iconColor: "var(--semantic-brand)",
    title: "!text-text-primary font-bold",
    confirmButton: "!bg-brand hover:!bg-brand-hover !text-text-on-brand",
    focusCancel: false,
  },
};

// Base compartida para que las alertas con inputs (p. ej. InventoryRowActions) usen
// exactamente los mismos estilos que las confirmaciones.
export function getConfirmAlertOptions({
  title,
  text,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
  variant = "danger",
} = {}) {
  const v = CONFIRM_VARIANTS[variant] ?? CONFIRM_VARIANTS.danger;
  return {
    title,
    text,
    icon: v.icon,
    iconColor: v.iconColor,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    // En "danger" el foco inicial va a Cancelar: un Enter no confirma por accidente.
    focusCancel: v.focusCancel,
    customClass: {
      popup: "!rounded-shape-xl",
      title: v.title,
      confirmButton: `${v.confirmButton} cursor-pointer px-4 py-2 rounded-md ml-2 font-medium`,
      cancelButton:
        "!bg-surface-muted hover:!bg-border !text-text-primary cursor-pointer px-4 py-2 rounded-md font-medium",
      input: "!rounded-md",
      validationMessage: "!bg-error-container !text-on-error-container",
    },
    buttonsStyling: false,
  };
}

/**
 * 2. Confirmación genérica con variante ("danger" | "warning" | "info").
 * El texto debe decir qué se afecta, con el nombre del registro.
 */
export function showConfirmAlert(options = {}) {
  return Swal.fire(getConfirmAlertOptions(options));
}

/**
 * Alias histórico: confirmación destructiva (variant "danger").
 */
export function showConfirmDeleteAlert({
  title = "¿Eliminar el registro?",
  text = "¡No podrás revertir esta acción!",
  confirmButtonText = "Sí, eliminar",
  cancelButtonText = "Cancelar",
} = {}) {
  return showConfirmAlert({ title, text, confirmButtonText, cancelButtonText, variant: "danger" });
}

/**
 * 3. Eliminación exitosa
 */
export const showSuccessAlert = async ({
  title = "¡Guardado con éxito!",
  text = "La operación se completó correctamente.",
  timer = 2000,
  confirmButtonText = "Aceptar",
} = {}) => {
  return await Swal.fire({
    title,
    text,
    icon: "success",
    timer,
    timerProgressBar: true,
    confirmButtonText,
    customClass: {
            popup: "!rounded-shape-xl",
            title: "!text-success",  
            confirmButton: "!bg-success hover:!bg-success/90 !text-on-success px-4 py-2 cursor-pointer rounded-md",
            timerProgressBar: "!bg-success",
        },

    buttonsStyling: false,
  });
}

/**
 * 4. Cancelación de eliminación
 */
export function showDeleteCancelAlert({
  title = "Eliminación cancelada",
  text = "No se ha realizado ninguna modificación.",
  timer = 2500,
} = {}) {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText: "Aceptar",
    timer,
    timerProgressBar: true,
    customClass: {
      popup: "!rounded-shape-xl",
      title: "!text-info font-bold",
      confirmButton:
        "!bg-info hover:!bg-info/90 !text-on-info cursor-pointer px-4 py-2 rounded-md",
      timerProgressBar: "!bg-info",
    },
    buttonsStyling: false,
  });
}

/**
 * 5. Error inesperado del sistema
 */
export function showSystemErrorAlert({
  title = "Error del sistema",
  text = "¡Ocurrió un fallo inesperado en el sistema!",
  footer,
} = {}) {
  if (forbiddenAlert) return forbiddenAlert;
  return Swal.fire({
    icon: "error",
    title,
    text,
    footer,
    confirmButtonText: "Entendido",
    customClass: {
      popup: "!rounded-shape-xl",
      title: "!text-error font-bold",
      confirmButton:
        "!bg-error hover:!bg-error/90 !text-on-error cursor-pointer px-4 py-2 rounded-md font-medium",
      footer: "text-sm text-text-secondary",
    },
    buttonsStyling: false,
  });
}
/**
 * 6. Advertencia de cierre de sesión por inactividad (useIdleSession). Variante warning.
 *  - Confirmar ("Seguir conectado") o Escape → el usuario está presente.
 *  - Cancelar ("Cerrar sesión") o tiempo agotado → cerrar la sesión.
 * No se cierra con clic fuera; la cuenta regresiva se actualiza con
 * updateSessionWarningCountdown.
 */
const secondsLabel = (seconds) => `${seconds} ${seconds === 1 ? "segundo" : "segundos"}`;

export function showSessionWarningAlert({ seconds, timer = seconds * 1000 } = {}) {
  const base = getConfirmAlertOptions({
    title: "¿Sigues ahí?",
    confirmButtonText: "Seguir conectado",
    cancelButtonText: "Cerrar sesión",
    variant: "warning",
  });
  return Swal.fire({
    ...base,
    text: undefined,
    html: `Por inactividad, tu sesión se cerrará en <strong data-session-countdown>${secondsLabel(seconds)}</strong>.`,
    timer,
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    focusConfirm: true,
    focusCancel: false,
    customClass: { ...base.customClass, timerProgressBar: "!bg-warning" },
  });
}

export function updateSessionWarningCountdown(seconds) {
  const el = Swal.getHtmlContainer()?.querySelector("[data-session-countdown]");
  if (el) el.textContent = secondsLabel(seconds);
}

export const SESSION_WARNING_RESULT = {
  // Escape cuenta como "seguir conectado": quien la pulsa está frente al equipo
  stayConnected: (result) => result.isConfirmed || result.dismiss === Swal.DismissReason.esc,
  logout: (result) =>
    result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.timer,
};
