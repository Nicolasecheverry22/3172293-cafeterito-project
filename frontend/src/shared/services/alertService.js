// src/shared/services/alertService.js

import Swal from "sweetalert2";

/**
 * 1. Error al crear (usuario, proveedor, producto, etc.)
 * Se dispara al presionar crear si falta un campo o falla la validación del schema.
 */
export const showCreateErrorAlert = async ({
  entity = "",
  title = "Campos incompletos",
  text,
} = {}) => {
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
 * 2. Confirmación antes de eliminar
 */
export function showConfirmDeleteAlert({
  title = "registro",
  text = "¡No podrás revertir esta acción!",
  confirmButtonText = "Sí, eliminar",
  cancelButtonText = "No, cancelar",
} = {}) {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: "!rounded-shape-xl",
      title: "!text-warning font-bold",
      confirmButton:
        "!bg-error hover:!bg-error/90 !text-on-error cursor-pointer px-4 py-2 rounded-md ml-2 font-medium",
      cancelButton:
        "!bg-surface-muted hover:!bg-border !text-text-primary cursor-pointer px-4 py-2 rounded-md font-medium",
    },
    buttonsStyling: false,
  });
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