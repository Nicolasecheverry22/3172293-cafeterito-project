// backend/src/features/auth/auth.repository.js
// Consultas de autenticación: login, bloqueo por intentos (RNF11) y
// códigos de recuperación de contraseña (RFADMIN01).

import { pool } from "../../config/db.js";

// Roles activos del usuario (el frontend los usa solo para mostrar u ocultar acciones;
// cada endpoint sensible vuelve a verificarlos en el servidor)
const GROUPS_SUBQUERY = `
  COALESCE((SELECT ARRAY_AGG(g.group_name ORDER BY g.group_name)
            FROM user_groups ug JOIN groups g ON g.group_id = ug.group_id
            WHERE ug.user_id = users.id AND g.is_active), '{}') AS groups`;

export const authRepository = {
  // is_locked se calcula en SQL con now() de la BD (evita desfases de reloj)
  async findByEmail(email, db = pool) {
    const result = await db.query(
      `SELECT id, user_email, user_name, user_image_thumb, user_password, is_active, failed_login_attempts,
              (locked_until IS NOT NULL AND locked_until > now()) AS is_locked,
              ${GROUPS_SUBQUERY}
       FROM users
       WHERE lower(user_email) = $1
       LIMIT 1`,
      [email]
    );
    return result.rows[0];
  },

  // Estado de sesión para el middleware: ¿sigue activo y sin bloqueo?
  async findSessionUser(id) {
    const result = await pool.query(
      `SELECT id, is_active,
              (locked_until IS NOT NULL AND locked_until > now()) AS is_locked
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Datos visibles del usuario en sesión (nombre y miniatura para el avatar del navbar)
  async findProfile(id) {
    const result = await pool.query(
      `SELECT user_name, user_image_thumb, ${GROUPS_SUBQUERY} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Suma un intento fallido; al llegar a maxAttempts bloquea la cuenta y reinicia el contador.
  // Atómico: dos intentos simultáneos no se pierden.
  async registerFailedAttempt(id, maxAttempts, lockMinutes) {
    const result = await pool.query(
      `UPDATE users
       SET failed_login_attempts = CASE WHEN failed_login_attempts + 1 >= $2 THEN 0
                                        ELSE failed_login_attempts + 1 END,
           locked_until = CASE WHEN failed_login_attempts + 1 >= $2
                               THEN now() + make_interval(mins => $3)
                               ELSE locked_until END
       WHERE id = $1
       RETURNING (locked_until IS NOT NULL AND locked_until > now()) AS is_locked`,
      [id, maxAttempts, lockMinutes]
    );
    return result.rows[0];
  },

  async resetLoginState(id, db = pool) {
    await db.query(
      "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1",
      [id]
    );
  },

  // ── Recuperación de contraseña ──────────────────────────────────
  // Invalida los códigos pendientes del usuario (solo el último solicitado es válido)
  async invalidateResetTokens(userId, db = pool) {
    await db.query(
      "UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
      [userId]
    );
  },

  async createResetToken(userId, tokenHash, minutes, db = pool) {
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + make_interval(mins => $3))`,
      [userId, tokenHash, minutes]
    );
  },

  // Código vigente del usuario: no usado, no vencido. FOR UPDATE si va en transacción.
  async findActiveResetToken(userId, db = pool, { lock = false } = {}) {
    const result = await db.query(
      `SELECT id, token_hash, attempts
       FROM password_reset_tokens
       WHERE user_id = $1 AND used_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 1
       ${lock ? "FOR UPDATE" : ""}`,
      [userId]
    );
    return result.rows[0];
  },

  async incrementResetAttempts(tokenId, db = pool) {
    await db.query(
      "UPDATE password_reset_tokens SET attempts = attempts + 1 WHERE id = $1",
      [tokenId]
    );
  },

  async markResetTokenUsed(tokenId, db = pool) {
    await db.query("UPDATE password_reset_tokens SET used_at = now() WHERE id = $1", [tokenId]);
  },

  async updatePassword(userId, passwordHash, db = pool) {
    await db.query("UPDATE users SET user_password = $2 WHERE id = $1", [userId, passwordHash]);
  },

  async withTransaction(fn) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  },
};
