import { pool } from "../../config/db.js";

// Consultas SQL del recurso inventory (suministros).
export const inventoryRepository = {
  async create(data) {
    const {
      provisionName, category, unit, stock, price,
      batch, minStock, maxStock, status,
    } = data;
    const query = `
      INSERT INTO inventory
        (provision_name, category, unit, stock, price, batch, min_stock, max_stock, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;
    const values = [
      provisionName, category, unit, stock, price,
      batch, minStock, maxStock, status,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getAll() {
    const query = `
      SELECT id,
             provision_name AS "provisionName",
             category,
             unit,
             stock,
             price::float AS price,
             batch,
             min_stock AS "minStock",
             max_stock AS "maxStock",
             status
      FROM inventory
      ORDER BY id;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT id,
             provision_name AS "provisionName",
             category,
             unit,
             stock,
             price::float AS price,
             batch,
             min_stock AS "minStock",
             max_stock AS "maxStock",
             status
      FROM inventory
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getReportData(category, status) {
    const query = `
      SELECT id,
             provision_name AS "provisionName",
             category,
             unit,
             stock,
             price::float AS price,
             batch,
             min_stock AS "minStock",
             max_stock AS "maxStock",
             status
      FROM inventory
      WHERE ($1::text IS NULL OR category = $1)
        AND ($2::text IS NULL OR status = $2)
      ORDER BY id;
    `;
    const result = await pool.query(query, [category || null, status || null]);
    return result.rows;
  },

  // Actualiza todos los campos editables. Retorna undefined si el id no existe.
  async update(id, data) {
    const {
      provisionName, category, unit, stock, price,
      batch, minStock, maxStock, status,
    } = data;
    const result = await pool.query(
      `UPDATE inventory
       SET provision_name = $1, category = $2, unit = $3, stock = $4, price = $5,
           batch = $6, min_stock = $7, max_stock = $8, status = $9
       WHERE id = $10
       RETURNING id`,
      [provisionName, category, unit, stock, price, batch, minStock, maxStock, status, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query(
      "DELETE FROM inventory WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  },
};
