import { userRepository } from "./user.repository.js";
import { normalizePermissionIds } from "../permissions/permissions.service.js";
import { httpError } from "../../utils/httpError.js";
import { accessService, can, MANAGE_PERMISSIONS } from "../access/access.service.js";
import { authRepository } from "../auth/auth.repository.js";
import bcrypt from "bcrypt";

export const ADMIN_GROUP = "Administrador";

const ONLY_SUPERUSER = "Solo un superusuario puede modificar a otro superusuario";

// Reglas comunes al modificar a OTRO usuario: solo un superusuario toca a un superusuario.
async function loadTarget(id, auth) {
  const target = await userRepository.getById(id);
  if (target?.is_superuser && !auth?.isSuperuser) throw httpError(403, ONLY_SUPERUSER);
  return target;
}

// Verificación dentro de la transacción: el que edita no se queda sin acceso
// y el sistema conserva al menos un superusuario activo.
const antiLockout = (currentUserId, targetId, auth) => async (client) => {
  if (currentUserId === targetId) await accessService.assertKeepsOwnAccess(client, currentUserId, auth);
  await accessService.assertActiveSuperuserRemains(client);
};

// La entrada llega validada y normalizada por user.schema.js
// (correo en minúsculas, documento/teléfono numéricos, contraseña RNF10, ≥ 1 grupo).
export const userService = {
  // auth: req.auth del usuario que crea. El rol Administrador (= superusuario) solo lo
  // asigna otro superusuario.
  async createUser(data, auth) {
    if (data.groupNames.includes(ADMIN_GROUP) && !auth?.isSuperuser) {
      throw httpError(403, "Solo un superusuario puede crear usuarios Administrador");
    }
    // userData se arma campo por campo: los flags de privilegios NUNCA vienen del cliente.
    const userData = {
      userName: data.userName,
      userEmail: data.userEmail,
      userPersonalEmail: data.userPersonalEmail ?? null,
      userPhone: data.userPhone,
      userDocumentTypes: data.userDocumentTypes,
      userDocumentNumber: data.userDocumentNumber,
      userAddress: data.userAddress ?? null,
      userPassword: await bcrypt.hash(data.userPassword, 10),
      userImage: data.userImage ?? null,
      userImageThumb: data.userImageThumb ?? null,
      isStaff: false,
      isActive: true,
      // El rol Administrador = superusuario (mismo criterio que al editar)
      isSuperuser: data.groupNames.includes(ADMIN_GROUP),
    };

    return await userRepository.createWithGroups(userData, data.groupNames);
  },

  async updateUser(id, data, auth, currentUserId) {
    const target = await loadTarget(id, auth);
    if (!target) return undefined;

    if (id === currentUserId && data.isActive === false) {
      throw httpError(400, "No puede desactivar su propia cuenta");
    }
    // Cambiar el rol es asignar permisos: requiere manage_permissions (o ser superusuario)
    const sameGroups =
      target.groups.length === data.groupNames.length &&
      data.groupNames.every((name) => target.groups.includes(name));
    if (!sameGroups && !can(auth, MANAGE_PERMISSIONS)) {
      throw httpError(403, "No tienes permiso para cambiar el rol de un usuario");
    }
    if (data.groupNames.includes(ADMIN_GROUP) && !target.is_superuser && !auth?.isSuperuser) {
      throw httpError(403, "Solo un superusuario puede asignar el rol Administrador");
    }

    const userData = {
      userName: data.userName,
      userEmail: data.userEmail,
      userPersonalEmail: data.userPersonalEmail ?? null,
      userPhone: data.userPhone,
      userDocumentTypes: data.userDocumentTypes,
      userDocumentNumber: data.userDocumentNumber,
      userAddress: data.userAddress ?? null,
      // Sin foto nueva se conserva la actual; removeImage la quita
      userImage: data.userImage ?? null,
      userImageThumb: data.userImageThumb ?? null,
      removeImage: Boolean(data.removeImage),
      // undefined → se conserva el estado actual
      isActive: data.isActive,
      isSuperuser: data.groupNames.includes(ADMIN_GROUP),
    };

    return await userRepository.updateWithGroups(
      id, userData, data.groupNames, antiLockout(currentUserId, id, auth)
    );
  },

  // Listado con filtros opcionales y paginación opcional (ver utils/listQuery.js)
  async list(query) {
    return await userRepository.list(query);
  },

  async getById(id) {
    return await userRepository.getById(id);
  },

  // Habilitar/deshabilitar (no hay borrado físico). Un usuario no puede desactivarse a sí mismo.
  async setStatus(id, isActive, currentUserId, auth) {
    if (!isActive && id === currentUserId) {
      throw httpError(400, "No puede desactivar su propia cuenta");
    }
    const target = await loadTarget(id, auth);
    if (!target) return undefined;
    return await userRepository.setStatus(id, isActive, antiLockout(currentUserId, id, auth));
  },

  async getPermissions(userId) {
    const user = await userRepository.getById(userId);
    if (!user) throw httpError(404, "Usuario no encontrado");

    return await userRepository.getPermissionsByUserId(userId);
  },

  // ── Mi perfil ──────────────────────────────────────────────────
  // Datos propios + roles (solo lectura) + permisos efectivos para la interfaz
  async getMe(userId) {
    const user = await userRepository.getById(userId);
    if (!user) throw httpError(404, "Usuario no encontrado");
    return { ...user, ...(await accessService.getSessionAccess(userId)) };
  },

  async updateMe(userId, data) {
    const current = await userRepository.getById(userId);
    if (!current) throw httpError(404, "Usuario no encontrado");
    if (data.userPersonalEmail && data.userPersonalEmail === current.userEmail.toLowerCase()) {
      throw httpError(400, "El correo personal debe ser distinto del correo empresarial");
    }
    return await userRepository.updateProfile(userId, data);
  },

  // Verifica la contraseña actual; la nueva cumple RNF10 (Joi). Reinicia los intentos fallidos.
  async changeMyPassword(userId, { currentPassword, newPassword }) {
    const hash = await userRepository.getPasswordHash(userId);
    if (!hash || !(await bcrypt.compare(currentPassword, hash))) {
      throw httpError(400, "La contraseña actual no es correcta");
    }
    if (await bcrypt.compare(newPassword, hash)) {
      throw httpError(400, "La nueva contraseña debe ser distinta de la actual");
    }
    await authRepository.withTransaction(async (client) => {
      await authRepository.updatePassword(userId, await bcrypt.hash(newPassword, 10), client);
      await authRepository.resetLoginState(userId, client);
    });
  },

  async getReportData(documentNumber) {
    return await userRepository.getByDocument(documentNumber);
  },

  async updatePermissions(userId, permissionIds, auth, currentUserId) {
    const ids = normalizePermissionIds(permissionIds);
    if (!ids) throw httpError(400, "permissionIds debe ser un arreglo de ids numéricos");

    const user = await loadTarget(userId, auth);
    if (!user) throw httpError(404, "Usuario no encontrado");

    return await userRepository.updatePermissions(userId, ids, antiLockout(currentUserId, userId, auth));
  },
};
