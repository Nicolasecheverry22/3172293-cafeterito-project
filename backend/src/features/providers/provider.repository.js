import { pool } from "../../config/db.js";

// Consultas SQL del recurso providers (proveedores).
export const providerRepository = {
  async create(data) {
    const {
      nit,
      providerName,
      providerEmail,
      providerPhone,
      providerAddress,
      productService,
      isActive,
    } = data;
    const query = `
      INSERT INTO providers
        (nit, provider_name, provider_email, provider_phone, provider_address, product_service, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [
      nit,
      providerName,
      providerEmail,
      providerPhone,
      providerAddress,
      productService,
      isActive ?? true,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getAll() {
    const query = `
      SELECT id,
             nit,
             provider_name AS "providerName",
             provider_email AS "providerEmail",
             provider_phone AS "providerPhone",
             provider_address AS "providerAddress",
             product_service AS "productService",
             is_active
      FROM providers
      ORDER BY id;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT id,
             nit,
             provider_name AS "providerName",
             provider_email AS "providerEmail",
             provider_phone AS "providerPhone",
             provider_address AS "providerAddress",
             product_service AS "productService",
             is_active
      FROM providers
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Obtener proveedores para reporte (todos o filtrados por NIT)
  async getReportData(nit) {
    const query = `
      SELECT id,
             nit,
             provider_name AS "providerName",
             provider_email AS "providerEmail",
             provider_phone AS "providerPhone",
             provider_address AS "providerAddress",
             product_service AS "productService",
             is_active
      FROM providers
      WHERE ($1::text IS NULL OR nit = $1)
      ORDER BY id;
    `;
    const result = await pool.query(query, [nit || null]);
    return result.rows;
  },

  // Actualiza todos los campos editables. Retorna undefined si el id no existe.
  async update(id, data) {
    const {
      nit, providerName, providerEmail, providerPhone,
      providerAddress, productService, isActive,
    } = data;
    const result = await pool.query(
      `UPDATE providers
       SET nit = $1, provider_name = $2, provider_email = $3, provider_phone = $4,
           provider_address = $5, product_service = $6, is_active = $7
       WHERE id = $8
       RETURNING id`,
      [nit, providerName, providerEmail, providerPhone, providerAddress, productService, isActive, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query(
      "DELETE FROM providers WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  },
};

