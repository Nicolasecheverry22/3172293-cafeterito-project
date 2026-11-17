
export const httpError = (statusCode, message, details) =>
  Object.assign(new Error(message), { statusCode, ...(details && { details }) });
