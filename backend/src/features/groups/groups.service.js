// backend/src/features/groups/groups.service.js

import { groupsRepository } from "./groups.repository.js";
import { normalizePermissionIds } from "../permissions/permissions.service.js";
import { accessService } from "../access/access.service.js";
import { httpError } from "../../utils/httpError.js";

const ADMIN_GROUP = "Administrador";

export const groupsService = {
  async getAll() {
    return await groupsRepository.getAll();
  },

  async getPermissionsByGroupId(groupId) {
    return await groupsRepository.getPermissionsByGroupId(groupId);
  },

  // auth: req.auth de quien edita. Sus miembros son superusuarios, así que el grupo
  // Administrador solo lo edita un superusuario. Quien edita no puede quitarse a sí mismo
  // manage_permissions a través de un grupo al que pertenece.
  async updatePermissions(groupId, permissionIds, auth, currentUserId) {
    const ids = normalizePermissionIds(permissionIds);
    if (!ids) throw httpError(400, "permissionIds debe ser un arreglo de ids numéricos");

    const group = await groupsRepository.getById(groupId);
    if (!group) throw httpError(404, "Grupo no encontrado");
    if (group.group_name === ADMIN_GROUP && !auth?.isSuperuser) {
      throw httpError(403, "Solo un superusuario puede modificar los permisos del grupo Administrador");
    }

    return await groupsRepository.updatePermissions(groupId, ids, (client) =>
      accessService.assertKeepsOwnAccess(client, currentUserId, auth)
    );
  },
};
