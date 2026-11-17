// Error con código HTTP: el middleware global de errores (error.middleware.js)
// responde con este statusCode y este mensaje en lugar de un 500 genérico.
// `details` (opcional) se envía al cliente; útil para listas de errores de validación.
export const httpError = (statusCode, message, details) =>
  Object.assign(new Error(message), { statusCode, ...(details && { details }) });
