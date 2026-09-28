// src/shared/services/alertService.js

import Swal from "sweetalert2";

/**
 * 1. Error al crear (usuario, proveedor, producto, etc.)
 * Se dispara al presionar crear si falta un campo o falla la validación del schema.
 */
export const showCreateErrorAlert = async ({
  entity = "registro",
  title = "Campos incompletos",
  text,
} = {}) => {
  return await Swal.fire({
    title,
    text: text || `Por favor completa los campos requeridos para el ${entity}.`,
    icon: "warning",
    confirmButtonText: "Entendido",
    customClass: {
      popup: "rounded-2xl",
      confirmButton:
        "!bg-amber-500 hover:!bg-amber-600 text-white px-4 py-2 rounded-lg font-medium cursor-pointer",
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
      popup: "rounded-2xl",
      title: "!text-amber-600 font-bold",
      confirmButton:
        "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg ml-2 font-medium",
      cancelButton:
        "!bg-gray-500 hover:!bg-gray-600 text-white cursor-pointer px-4 py-2 rounded-lg font-medium",
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
            popup: "rounded-2x1",
            title: "text-green-600",  
            confirmButton: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 cursor-pointer rounded-lg",
            timerProgressBar: "!bg-green-600",
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
      popup: "rounded-2xl",
      title: "!text-blue-600 font-bold",
      confirmButton:
        "!bg-blue-600 hover:!bg-blue-700 text-white cursor-pointer px-4 py-2 rounded-lg",
      timerProgressBar: "!bg-blue-600",
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
      popup: "rounded-2xl",
      title: "!text-red-600 font-bold",
      confirmButton:
        "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg font-medium",
      footer: "text-sm text-gray-500",
    },
    buttonsStyling: false,
  });
}