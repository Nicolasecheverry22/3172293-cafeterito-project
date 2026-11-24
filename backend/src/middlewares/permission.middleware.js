// backend/src/middlewares/permission.middleware.js
// Autorización por permisos.
// - loadPermissions: va justo después de authenticateToken (app.js). Carga UNA vez por
//   petición req.auth = { isSuperuser, permissions: Set<codename> }.
// - requirePermission(code | [codes]): basta con tener uno de los permisos. No consulta la BD.

import { accessService, can } from "../features/access/access.service.js";
import { httpError } from "../utils/httpError.js";

export const FORBIDDEN_MESSAGE = "No tienes permiso para realizar esta acción";

export const loadPermissions = async (req, res, next) => {
  req.auth = await accessService.getContext(req.user.id);
  next();
};

export const requirePermission = (codes) => (req, res, next) => {
  if (!req.auth) return next(new Error("requirePermission requiere loadPermissions antes"));
  if (!can(req.auth, codes)) return next(httpError(403, FORBIDDEN_MESSAGE));
  next();
};
