// backend/src/features/permissions/permissions.service.js

import { permissionsRepository } from "./permissions.repository.js";

// Valida y limpia una lista de ids de permisos que llega en el body.
// Retorna null si el formato es inválido; un arreglo (posiblemente vacío) si es válido.
// La reutilizan groups.service y user.service al asignar permisos.
export const normalizePermissionIds = (permissionIds) => {
  if (!Array.isArray(permissionIds)) return null;

  const ids = permissionIds.map(Number);
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) return null;

  return [...new Set(ids)];
};

export const permissionsService = {
  async getAll() {
    return await permissionsRepository.getAll();
  },
};
