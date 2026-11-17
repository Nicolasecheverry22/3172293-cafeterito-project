import { pool } from "../../config/db.js";

// Columnas devueltas al frontend (alias en camelCase)
const PROVIDER_COLUMNS = `
  id,
  document_type    AS "documentType",
  nit,
  provider_name    AS "providerName",
  provider_email   AS "providerEmail",
  provider_phone   AS "providerPhone",
  provider_address AS "providerAddress",
  product_service  AS "productService",
  is_active
`;

// Consultas SQL del recurso providers (proveedores).
export const providerRepository = {
  async create(data) {
    const {
      documentType, nit, providerName, providerEmail,
      providerPhone, providerAddress, productService, isActive,
    } = data;
    const result = await pool.query(
      `INSERT INTO providers
         (document_type, nit, provider_name, provider_email, provider_phone,
          provider_address, product_service, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        documentType, nit, providerName, providerEmail, providerPhone,
        providerAddress ?? null, productService ?? null, isActive ?? true,
      ]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query(`SELECT ${PROVIDER_COLUMNS} FROM providers ORDER BY id`);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(`SELECT ${PROVIDER_COLUMNS} FROM providers WHERE id = $1`, [id]);
    return result.rows[0];
  },

  // Obtener proveedores para reporte (todos o filtrados por NIT)
  async getReportData(nit) {
    const result = await pool.query(
      `SELECT ${PROVIDER_COLUMNS}
       FROM providers
       WHERE ($1::text IS NULL OR nit = $1)
       ORDER BY id`,
      [nit || null]
    );
    return result.rows;
  },

  // Actualiza todos los campos editables. Retorna undefined si el id no existe.
  async update(id, data) {
    const {
      documentType, nit, providerName, providerEmail,
      providerPhone, providerAddress, productService, isActive,
    } = data;
    const result = await pool.query(
      `UPDATE providers
       SET document_type = $1, nit = $2, provider_name = $3, provider_email = $4,
           provider_phone = $5, provider_address = $6, product_service = $7, is_active = $8
       WHERE id = $9
       RETURNING id`,
      [
        documentType, nit, providerName, providerEmail, providerPhone,
        providerAddress ?? null, productService ?? null, isActive, id,
      ]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query("DELETE FROM providers WHERE id = $1 RETURNING id", [id]);
    return result.rows[0];
  },
};
