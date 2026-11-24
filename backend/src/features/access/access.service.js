// backend/src/features/access/access.service.js
// Regla de autorización: superusuario → permisos directos → permisos por grupo (activos).

import { accessRepository } from "./access.repository.js";
import { httpError } from "../../utils/httpError.js";

export const MANAGE_PERMISSIONS = "manage_permissions";

// ¿El contexto (req.auth) tiene al menos uno de los permisos? El superusuario siempre puede.
export const can = (auth, codes) =>
  Boolean(auth?.isSuperuser) || [].concat(codes).some((code) => auth?.permissions?.has(code));

export const accessService = {
  async hasPermission(userId, permissionCode) {
    const auth = await this.getContext(userId);
    return can(auth, permissionCode);
  },

  // { isSuperuser, permissions: Set } — lo usa loadPermissions una vez por petición
  async getContext(userId, db) {
    const { isSuperuser, permissions } = await accessRepository.getAuthContext(userId, db);
    return { isSuperuser, permissions: new Set(permissions) };
  },

  // Para la sesión del frontend (login / refresh / perfil): codenames efectivos.
  // Al superusuario se le envía el catálogo completo. Es SOLO para la interfaz.
  async getSessionAccess(userId) {
    const { isSuperuser, permissions } = await accessRepository.getAuthContext(userId);
    return {
      isSuperuser,
      permissions: isSuperuser ? await accessRepository.getAllCodenames() : permissions,
    };
  },

  // ── Reglas anti-bloqueo (se llaman DENTRO de la transacción del cambio) ──
  // `before` es el req.auth del usuario que hace el cambio (antes de aplicarlo).
  async assertKeepsOwnAccess(client, userId, before) {
    const after = await this.getContext(userId, client);
    if (before.isSuperuser && !after.isSuperuser) {
      throw httpError(409, "No puedes quitarte a ti mismo el rol de Administrador");
    }
    if (!before.isSuperuser && before.permissions.has(MANAGE_PERMISSIONS) && !can(after, MANAGE_PERMISSIONS)) {
      throw httpError(409, "No puedes quitarte a ti mismo el permiso de gestionar roles y permisos");
    }
  },

  async assertActiveSuperuserRemains(client) {
    if ((await accessRepository.countActiveSuperusers(client)) < 1) {
      throw httpError(409, "El sistema debe conservar al menos un superusuario activo");
    }
  },
};
