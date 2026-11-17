// Traduce violaciones de constraints concretas (err.constraint) a errores HTTP con
// un mensaje claro para el usuario. Lo no mapeado sigue al middleware global.
//
// Uso:
//   const withErrors = withConstraintErrors({
//     uq_providers_nit: [409, "Ya existe un proveedor con ese documento"],
//   });
//   export const controller = { create: withErrors(async (req, res) => { ... }) };
import { httpError } from "./httpError.js";

export const withConstraintErrors = (map) => (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (err) {
    const mapped = err.constraint && map[err.constraint];
    throw mapped ? httpError(mapped[0], mapped[1]) : err;
  }
};
