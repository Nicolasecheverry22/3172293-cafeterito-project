import { userRepository } from "./user.repository.js";
import { normalizePermissionIds } from "../permissions/permissions.service.js";
import { httpError } from "../../utils/httpError.js";
import bcrypt from "bcrypt";

const ADMIN_GROUP = "Administrador";

// La entrada llega validada y normalizada por user.schema.js
// (correo en minúsculas, documento/teléfono numéricos, contraseña RNF10, ≥ 1 grupo).
export const userService = {
  async createUser(data) {
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

  async updateUser(id, data) {
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

    return await userRepository.updateWithGroups(id, userData, data.groupNames);
  },

  // Listado con filtros opcionales y paginación opcional (ver utils/listQuery.js)
  async list(query) {
    return await userRepository.list(query);
  },

  async getById(id) {
    return await userRepository.getById(id);
  },

  // Habilitar/deshabilitar (no hay borrado físico). Un usuario no puede desactivarse a sí mismo.
  async setStatus(id, isActive, currentUserId) {
    if (!isActive && id === currentUserId) {
      throw httpError(400, "No puede desactivar su propia cuenta");
    }
    return await userRepository.setStatus(id, isActive);
  },

  async getPermissions(userId) {
    const user = await userRepository.getById(userId);
    if (!user) throw httpError(404, "Usuario no encontrado");

    return await userRepository.getPermissionsByUserId(userId);
  },

  async getReportData(documentNumber) {
    return await userRepository.getByDocument(documentNumber);
  },

  async updatePermissions(userId, permissionIds) {
    const ids = normalizePermissionIds(permissionIds);
    if (!ids) throw httpError(400, "permissionIds debe ser un arreglo de ids numéricos");

    const user = await userRepository.getById(userId);
    if (!user) throw httpError(404, "Usuario no encontrado");

    return await userRepository.updatePermissions(userId, ids);
  },
};
