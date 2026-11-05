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

  async remove(id) {
    const result = await pool.query(
      "DELETE FROM inventory WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  },
};
