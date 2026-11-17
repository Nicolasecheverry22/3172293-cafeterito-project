import { userRepository } from "./user.repository.js";
import { normalizePermissionIds } from "../permissions/permissions.service.js";
import { httpError } from "../../utils/httpError.js";
import bcrypt from "bcrypt";

const ADMIN_GROUP = "Administrador";

// Limpia la lista de grupos que llega del frontend: solo strings no vacíos, sin duplicados.
const normalizeGroupNames = (groupNames) => {
  if (!Array.isArray(groupNames)) return [];
  return [
    ...new Set(
      groupNames
        .filter((name) => typeof name === "string")
        .map((name) => name.trim())
        .filter(Boolean)
    ),
  ];
};

export const userService = {
  async createUser(data) {
    if (typeof data.userPassword !== "string" || data.userPassword.length === 0) {
      throw httpError(400, "La contraseña es obligatoria");
    }

    const groupNames = normalizeGroupNames(data.groupNames);
    if (groupNames.length === 0) {
      throw httpError(400, "Debe seleccionar al menos un tipo de usuario");
    }

    // userData se arma campo por campo: los flags de privilegios NUNCA vienen del cliente.
    const userData = {
      userName: data.userName,
      userEmail: typeof data.userEmail === "string" ? data.userEmail.trim().toLowerCase() : data.userEmail,
      userPhone: data.userPhone,
      userDocumentTypes: data.userDocumentTypes,
      userDocumentNumber: data.userDocumentNumber,
      userPassword: await bcrypt.hash(data.userPassword, 10),
      userAvatarUrl: data.userAvatarUrl ?? null,
      isStaff: false,
      isActive: true,
      // El rol Administrador = superusuario (mismo criterio que al editar)
      isSuperuser: groupNames.includes(ADMIN_GROUP),
    };

    return await userRepository.createWithGroups(userData, groupNames);
  },

  async updateUser(id, data) {
    const requireText = (value, field) => {
      if (typeof value !== "string" || value.trim() === "") {
        throw httpError(400, `El campo ${field} es obligatorio`);
      }
      return value.trim();
    };

    const groupNames = normalizeGroupNames(data.groupNames);
    if (groupNames.length === 0) {
      throw httpError(400, "Debe seleccionar al menos un tipo de usuario");
    }

    const userData = {
      userName: requireText(data.userName, "nombre"),
      userEmail: requireText(data.userEmail, "correo").toLowerCase(),
      userPhone: requireText(data.userPhone, "teléfono"),
      userDocumentTypes: requireText(data.userDocumentTypes, "tipo de documento"),
      userDocumentNumber: requireText(data.userDocumentNumber, "número de documento"),
      isActive: Boolean(data.isActive),
      isSuperuser: groupNames.includes(ADMIN_GROUP),
    };

    return await userRepository.updateWithGroups(id, userData, groupNames);
  },

  async getAll() {
    return await userRepository.getAll();
  },

  async getById(id) {
    return await userRepository.getById(id);
  },

  async remove(id) {
    return await userRepository.remove(id);
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
