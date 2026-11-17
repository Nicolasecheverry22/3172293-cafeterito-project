// backend/src/features/auth/auth.service.js
// Lógica de autenticación + JWT

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { httpError } from "../../utils/httpError.js";

const INVALID_CREDENTIALS = "Credenciales inválidas";

export const authService = {
  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw httpError(401, INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) {
      throw httpError(401, INVALID_CREDENTIALS);
    }

    if (!user.is_active) {
      throw httpError(401, "Usuario inactivo");
    }

    const token = jwt.sign(
      { id: user.id, email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    return {
      token,
      user: { id: user.id, email: user.user_email },
    };
  },
};
