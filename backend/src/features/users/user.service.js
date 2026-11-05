import { userRepository } from "./user.repository.js";
import { normalizePermissionIds } from "../permissions/permissions.service.js";
import bcrypt from "bcrypt";

// Error con código HTTP para que el controller responda 400/404 en lugar de 500.
const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

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

    const hashedPassword = await bcrypt.hash(data.userPassword, 10);

    const userData = {
      ...data,
      userPassword: hashedPassword,
    };

    return await userRepository.createWithGroups(userData, groupNames);
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

  async updatePermissions(userId, permissionIds) {
    const ids = normalizePermissionIds(permissionIds);
    if (!ids) throw httpError(400, "permissionIds debe ser un arreglo de ids numéricos");

    const user = await userRepository.getById(userId);
    if (!user) throw httpError(404, "Usuario no encontrado");

    return await userRepository.updatePermissions(userId, ids);
  },
};
