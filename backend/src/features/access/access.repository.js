import { pool } from "../../config/db.js";

// Permisos efectivos = directos (user_permissions) + heredados de grupos ACTIVOS.
// Un usuario inactivo no tiene ningún permiso (ni superusuario).
const EFFECTIVE_PERMISSIONS = `
  SELECT p.permission_codename
  FROM permissions p
  JOIN user_permissions up ON up.permission_id = p.permission_id
  JOIN users u             ON u.id = up.user_id AND u.is_active
  WHERE up.user_id = $1
  UNION
  SELECT p.permission_codename
  FROM permissions p
  JOIN group_permissions gp ON gp.permission_id = p.permission_id
  JOIN user_groups ug       ON ug.group_id = gp.group_id
  JOIN groups g             ON g.group_id = ug.group_id AND g.is_active
  JOIN users u              ON u.id = ug.user_id AND u.is_active
  WHERE ug.user_id = $1`;

export const accessRepository = {
  async isSuperUser(userId, db = pool) {
    const result = await db.query(
      "SELECT is_superuser AND is_active AS is_superuser FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0]?.is_superuser ?? false;
  },

  async getUserPermissions(userId, db = pool) {
    const result = await db.query(EFFECTIVE_PERMISSIONS, [userId]);
    return result.rows.map((row) => row.permission_codename);
  },

  // Contexto de autorización en UNA consulta: { isSuperuser, permissions: string[] }.
  // `db` permite leerlo dentro de una transacción (verificaciones anti-bloqueo).
  async getAuthContext(userId, db = pool) {
    const result = await db.query(
      `SELECT COALESCE((SELECT is_superuser AND is_active FROM users WHERE id = $1), FALSE) AS is_superuser,
              COALESCE((SELECT ARRAY_AGG(permission_codename ORDER BY permission_codename)
                        FROM (${EFFECTIVE_PERMISSIONS}) eff), '{}') AS permissions`,
      [userId]
    );
    const row = result.rows[0];
    return { isSuperuser: row.is_superuser, permissions: row.permissions };
  },

  // Catálogo completo (lo que "tiene" un superusuario de cara a la interfaz)
  async getAllCodenames(db = pool) {
    const result = await db.query(
      "SELECT permission_codename FROM permissions ORDER BY permission_codename"
    );
    return result.rows.map((row) => row.permission_codename);
  },

  async countActiveSuperusers(db = pool) {
    const result = await db.query(
      "SELECT COUNT(*)::int AS total FROM users WHERE is_superuser AND is_active"
    );
    return result.rows[0].total;
  },
};
