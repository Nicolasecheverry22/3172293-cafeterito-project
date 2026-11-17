// Manejo centralizado de errores y rutas inexistentes.
// Express 5 propaga a este middleware los errores lanzados en handlers async,
// así que los controllers no necesitan try/catch para responder 500.

// Errores de PostgreSQL → respuesta HTTP con mensaje genérico (sin detalles internos)
const PG_ERRORS = {
  23505: [409, "Ya existe un registro con esos datos"], // unique_violation
  23503: [409, "La operación no es posible: el registro está relacionado con otros datos"], // foreign_key_violation
  "22P02": [400, "Formato de dato inválido"], // invalid_text_representation
  23502: [400, "Falta un campo obligatorio"], // not_null_violation
  23514: [400, "Un valor no cumple las reglas permitidas"], // check_violation
  22001: [400, "Un valor excede la longitud permitida"], // string_data_right_truncation
  22003: [400, "Un valor numérico está fuera de rango"], // numeric_value_out_of_range
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Errores de body-parser (express.json)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "El cuerpo de la petición es demasiado grande" });
  }

  // Errores controlados (httpError) con estado 4xx: el mensaje es seguro para el cliente
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  const pg = PG_ERRORS[err.code];
  if (pg) {
    return res.status(pg[0]).json({ error: pg[1] });
  }

  // Error inesperado: se registra el detalle solo en el servidor
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: "Error interno del servidor" });
};
