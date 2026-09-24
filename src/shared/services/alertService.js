// src/shared/services/alertService.js

import Swal from "sweetalert2";

/**
 * Alerta para operaciones exitosas.
 */
export function showSuccessAlert({
  title = "Éxito",
  text = "",
  confirmButtonText = "Aceptar",
  timer = 3000,
}) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText,
    timer,
    timerProgressBar: true,

    customClass: {
      popup: "rounded-2xl",
      title: "!text-green-600",
      confirmButton:
        "!bg-green-600 hover:!bg-green-700 text-white cursor-pointer px-4 py-2 rounded-lg",
      timerProgressBar: "!bg-green-600",
    },

    buttonsStyling: false,
  });
}

/**
 * Alerta para indicar que una operación fue cancelada.
 */
export function showCancelAlert({
  title = "Cancelado",
  text = "",
  confirmButtonText = "Aceptar",
  timer = 3000,
}) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText,
    timer,
    timerProgressBar: true,
    showConfirmButton: true,

    customClass: {
      popup: "rounded-2xl",
      title: "!text-red-600",
      confirmButton:
        "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg",
      timerProgressBar: "!bg-red-600",
    },

    buttonsStyling: false,
  });
}

/**
 * Alerta para confirmar la eliminación de un registro.
 */
export function showConfirmDeleteAlert({
  title = "¿Estás seguro?",
  text = "¡No podrás revertir esta acción!",
  confirmButtonText = "Sí, eliminar",
  cancelButtonText = "No, cancelar",
}) {
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
 * Alerta para errores.
 */
export function showErrorAlert({
  title = "Ops, hubo un error",
  text = "¡Ocurrió un fallo inesperado en el sistema!",
  footer,
  confirmButtonText = "Entendido",
} = {}) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    footer,
    confirmButtonText,

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
