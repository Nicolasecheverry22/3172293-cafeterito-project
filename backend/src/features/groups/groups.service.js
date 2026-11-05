// backend/src/features/groups/groups.service.js

import { groupsRepository } from "./groups.repository.js";
import { normalizePermissionIds } from "../permissions/permissions.service.js";

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

export const groupsService = {
  async getAll() {
    return await groupsRepository.getAll();
  },

  async getPermissionsByGroupId(groupId) {
    return await groupsRepository.getPermissionsByGroupId(groupId);
  },

  async updatePermissions(groupId, permissionIds) {
    const ids = normalizePermissionIds(permissionIds);
    if (!ids) throw httpError(400, "permissionIds debe ser un arreglo de ids numéricos");

    return await groupsRepository.updatePermissions(groupId, ids);
  },
};
