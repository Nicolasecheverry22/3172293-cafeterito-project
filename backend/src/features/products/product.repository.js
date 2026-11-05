import { pool } from "../../config/db.js";

// Consultas SQL del recurso products (platillos del menú).
export const productRepository = {
  async create(data) {
    const { productName, category, price, description, isAvailable } = data;
    const query = `
      INSERT INTO products (product_name, category, price, description, is_available)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const values = [productName, category, price, description, isAvailable ?? true];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getAll() {
    const query = `
      SELECT id,
             product_name AS "productName",
             category,
             price::float AS price,
             is_available AS "isAvailable"
      FROM products
      ORDER BY id;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT id,
             product_name AS "productName",
             category,
             price::float AS price,
             description,
             is_available AS "isAvailable"
      FROM products
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  },
};
