// backend/src/features/access/access.controller.js
// Verifica un permiso dinámico del usuario autenticado (usa req.auth de loadPermissions)

import { can } from "./access.service.js";

export const accessController = {
  testPermission(req, res) {
    const permissionCode = req.params.permissionCode;
    res.json({
      userId: req.user.id,
      permission: permissionCode,
      granted: can(req.auth, permissionCode),
    });
  },
};
