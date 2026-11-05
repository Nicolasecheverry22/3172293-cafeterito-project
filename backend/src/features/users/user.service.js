import { userRepository } from "./user.repository.js";
import bcrypt from "bcrypt";

export const userService = {
  async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.userPassword, 10);

    const userData = {
      ...data,
      userPassword: hashedPassword,
    };

    const created = await userRepository.create(userData);

    // Si se eligió un grupo, se asocia el usuario a ese grupo (user_groups).
    if (data.groupId) {
      await userRepository.assignGroup(created.id, Number(data.groupId));
    }

    return created;
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
};