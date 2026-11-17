// Listados con filtros opcionales (SQL parametrizado) y paginación opcional.
//

import { Joi } from "./joi.js";
import { pool } from "../config/db.js";

// Campos de paginación comunes a todos los schemas de listado
export const paginationFields = {
  page: Joi.number().integer().min(1).label("La página"),
  limit: Joi.number().integer().min(1).max(100).label("El límite"),
};


const SORT_COLLATION = (process.env.DB_SORT_COLLATION || "es-x-icu").replace(/"/g, "");
export const alpha = (column) => `${column} COLLATE "${SORT_COLLATION}"`;

// Escapa los comodines de LIKE para que ?search=50% busque literalmente "50%"
export const likePattern = (text) => `%${String(text).replace(/[\\%_]/g, "\\$&")}%`;

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
    db.query(`SELECT count(*)::int AS total FROM (SELECT 1 ${base}) t`, params),
  ]);
  return { data: list.rows, total: count.rows[0].total, page, limit };
}
