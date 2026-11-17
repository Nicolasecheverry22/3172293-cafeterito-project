
import { httpError } from "./httpError.js";

export const withConstraintErrors = (map) => (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (err) {
    const mapped = err.constraint && map[err.constraint];
    throw mapped ? httpError(mapped[0], mapped[1]) : err;
  }
};
