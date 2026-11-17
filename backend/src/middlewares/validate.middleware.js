// Validación de entrada con Joi.
// Uso: router.post("/", validate({ body: schema }), controller.create)
//      router.put("/:id", validate({ params: idParam, body: schema }), ...)
//
// - abortEarly: false → devuelve TODOS los errores, no solo el primero.
// - stripUnknown: true → elimina campos no declarados en el schema (p. ej. isSuperuser).
// - Los valores convertidos (trim, lowercase, números) reemplazan los originales.
// - Si hay errores responde 400: { error: "<mensajes>", details: [{ field, message }] }.

const OPTIONS = { abortEarly: false, stripUnknown: true, convert: true };

export const validate = (schemas) => (req, res, next) => {
  const details = [];

  for (const source of ["params", "query", "body"]) {
    const schema = schemas[source];
    if (!schema) continue;

    const { error, value } = schema.validate(req[source] ?? {}, OPTIONS);

    if (error) {
      details.push(
        ...error.details.map((d) => ({ field: d.path.join("."), message: d.message }))
      );
      continue;
    }

    if (source === "query") {
      // En Express 5 req.query es un getter de solo lectura: se redefine la propiedad.
      Object.defineProperty(req, "query", { value, writable: true, configurable: true });
    } else {
      req[source] = value;
    }
  }

  if (details.length > 0) {
    return res.status(400).json({
      error: details.map((d) => d.message).join(". "),
      details,
    });
  }

  next();
};
