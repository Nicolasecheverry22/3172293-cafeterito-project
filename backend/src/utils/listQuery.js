// Listados con filtros opcionales (SQL parametrizado) y paginación opcional.
//
// Contrato (para no romper el frontend):
//   - Sin ?page y ?limit → la respuesta es un ARRAY con todos los registros filtrados.
//   - Con ?page y ?limit → { data, total, page, limit }.
import { Joi } from "./joi.js";
import { pool } from "../config/db.js";

// Campos de paginación comunes a todos los schemas de listado
export const paginationFields = {
  page: Joi.number().integer().min(1).label("La página"),
  limit: Joi.number().integer().min(1).max(100).label("El límite"),
};

// Collation para el orden alfabético en español (tildes y mayúsculas no alteran el orden).
// "es-x-icu" viene en las distribuciones oficiales de PostgreSQL (con ICU); se puede
// cambiar con DB_SORT_COLLATION si el servidor no tiene ICU (p. ej. "C" o "default").
const SORT_COLLATION = (process.env.DB_SORT_COLLATION || "es-x-icu").replace(/"/g, "");
export const alpha = (column) => `${column} COLLATE "${SORT_COLLATION}"`;

// Escapa los comodines de LIKE para que ?search=50% busque literalmente "50%"
export const likePattern = (text) => `%${String(text).replace(/[\\%_]/g, "\\$&")}%`;

// Acumula condiciones del WHERE. En cada condición, "$?" se reemplaza por el
// número de parámetro que le corresponde (se puede repetir en la misma condición).
export function createFilters() {
  const params = [];
  const clauses = [];
  return {
    params,
    add(sql, value) {
      params.push(value);
      clauses.push(sql.replaceAll("$?", `$${params.length}`));
    },
    where: () => (clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""),
  };
}

export async function runList({ select, from, filters, groupBy = "", orderBy, page, limit, db = pool }) {
  const base = `${from} ${filters.where()} ${groupBy}`;
  const { params } = filters;

  if (!page || !limit) {
    const { rows } = await db.query(`SELECT ${select} ${base} ORDER BY ${orderBy}`, params);
    return rows;
  }

  const n = params.length;
  const [list, count] = await Promise.all([
    db.query(
      `SELECT ${select} ${base} ORDER BY ${orderBy} LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...params, limit, (page - 1) * limit]
    ),
    // Subconsulta: cuenta bien aunque haya JOIN + GROUP BY (órdenes con sus ítems)
    db.query(`SELECT count(*)::int AS total FROM (SELECT 1 ${base}) t`, params),
  ]);
  return { data: list.rows, total: count.rows[0].total, page, limit };
}
