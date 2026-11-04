import { userRepository } from "./user.repository.js";
import bcrypt from "bcrypt";

export const userService = {
  async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.userPassword, 10);

    const userData = {
      ...data,
      userPassword: hashedPassword,
    };

    return await userRepository.create(userData);
  },
};