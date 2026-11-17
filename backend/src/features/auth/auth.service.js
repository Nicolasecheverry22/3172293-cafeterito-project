// backend/src/features/auth/auth.service.js
// Login con bloqueo por intentos (RNF11), sesión corta con refresh (RNF09) y
// recuperación de contraseña con código de 6 dígitos (RFADMIN01).

import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { httpError } from "../../utils/httpError.js";
import { sendMail } from "../../utils/mailer.js";

const INVALID_CREDENTIALS = "Credenciales inválidas";
const ACCOUNT_LOCKED = "Cuenta bloqueada temporalmente";
const INVALID_RESET_CODE = "El código es inválido o expiró";
const FORGOT_MESSAGE =
  "Si el correo está registrado, recibirás un código para restablecer tu contraseña.";

export const MAX_LOGIN_ATTEMPTS = 3;
export const LOCK_MINUTES = 15;
export const RESET_CODE_MINUTES = 15;
export const MAX_RESET_ATTEMPTS = 5;

// Hash del código de recuperación: HMAC con el secreto del servidor y el id del usuario.
// Un volcado de la tabla no permite probar los 10^6 códigos sin conocer el secreto.
export const hashResetCode = (userId, code) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(`${userId}:${code}`)
    .digest("hex");

const sameHash = (a, b) =>
  a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "10m",
  });

// Valida el código del usuario. Si es incorrecto suma un intento; tras
// MAX_RESET_ATTEMPTS el código queda inutilizable. Devuelve { user, token } o lanza 400.
async function verifyResetCode(email, code) {
  const user = await authRepository.findByEmail(email);
  if (!user || !user.is_active) throw httpError(400, INVALID_RESET_CODE);

  const token = await authRepository.findActiveResetToken(user.id);
  if (!token || token.attempts >= MAX_RESET_ATTEMPTS) throw httpError(400, INVALID_RESET_CODE);

  if (!sameHash(token.token_hash, hashResetCode(user.id, code))) {
    await authRepository.incrementResetAttempts(token.id);
    throw httpError(400, INVALID_RESET_CODE);
  }
  return { user, token };
}

export const authService = {
  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw httpError(401, INVALID_CREDENTIALS);

    // Bloqueada: no se evalúa la contraseña ni se suman intentos
    if (user.is_locked) throw httpError(423, ACCOUNT_LOCKED);

    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) {
      const { is_locked } = await authRepository.registerFailedAttempt(
        user.id, MAX_LOGIN_ATTEMPTS, LOCK_MINUTES
      );
      throw is_locked ? httpError(423, ACCOUNT_LOCKED) : httpError(401, INVALID_CREDENTIALS);
    }

    if (!user.is_active) throw httpError(401, "Usuario inactivo");

    if (user.failed_login_attempts > 0) await authRepository.resetLoginState(user.id);

    const sessionUser = { id: user.id, email: user.user_email };
    return { token: signToken(sessionUser), user: sessionUser };
  },

  // El middleware ya verificó el token y que el usuario siga activo y sin bloqueo.
  refresh(user) {
    const sessionUser = { id: user.id, email: user.email };
    return { token: signToken(sessionUser), user: sessionUser };
  },

  // Siempre responde lo mismo: no revela si el correo existe.
  async forgotPassword({ email }) {
    const user = await authRepository.findByEmail(email);

    if (user && user.is_active) {
      const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

      await authRepository.withTransaction(async (client) => {
        await authRepository.invalidateResetTokens(user.id, client);
        await authRepository.createResetToken(
          user.id, hashResetCode(user.id, code), RESET_CODE_MINUTES, client
        );
      });

      try {
        await sendMail({
          to: user.user_email,
          subject: "Cafeterito - Código para restablecer tu contraseña",
          text:
            `Tu código para restablecer la contraseña es: ${code}\n\n` +
            `Vence en ${RESET_CODE_MINUTES} minutos y solo se puede usar una vez.\n` +
            "Si no solicitaste este cambio, ignora este mensaje.",
        });
      } catch (err) {
        // No se revela al cliente: la respuesta debe ser idéntica exista o no el correo
        console.error("[MAIL] Error enviando el código de recuperación:", err.message);
      }
    }

    return { message: FORGOT_MESSAGE };
  },

  async verifyResetToken({ email, token }) {
    await verifyResetCode(email, token);
    return { valid: true, message: "Código válido" };
  },

  async resetPassword({ email, token, password }) {
    const passwordHash = await bcrypt.hash(password, 10);

    // 1) Se verifica fuera de la transacción para que un intento fallido quede registrado.
    const { user, token: row } = await verifyResetCode(email, token);

    await authRepository.withTransaction(async (client) => {
      // 2) FOR UPDATE: dos solicitudes simultáneas no pueden usar el mismo código
      const locked = await authRepository.findActiveResetToken(user.id, client, { lock: true });
      if (!locked || locked.id !== row.id) throw httpError(400, INVALID_RESET_CODE);
      await authRepository.updatePassword(user.id, passwordHash, client);
      await authRepository.markResetTokenUsed(row.id, client);
      // Restablecer la contraseña también levanta un bloqueo por intentos
      await authRepository.resetLoginState(user.id, client);
    });

    return { message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." };
  },
};
