// backend/src/features/access/access.service.js
// Regla de autorización: superuser -> permiso directo -> permiso por grupo

import { accessRepository } from "./access.repository.js";

export const accessService = {
  async hasPermission(userId, permissionCode) {
    // 1. ¿Es superusuario? -> acceso permitido
    const isSuperUser = await accessRepository.isSuperUser(userId);

    if (isSuperUser) {
      return true;
    }

    // 2/3. Permisos individuales + heredados de grupos
    const permissions = await accessRepository.getUserPermissions(userId);

    return permissions.includes(permissionCode);
  },
};
