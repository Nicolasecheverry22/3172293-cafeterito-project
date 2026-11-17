import { pool } from "../../config/db.js";
import { OPEN_ORDER_STATUSES } from "../orders/order.constants.js";

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
             description,
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

  // Obtener platillos para reporte con filtro opcional de categoría
  async getReportData(category) {
    const query = `
      SELECT id,
             product_name AS "productName",
             category,
             price::float AS price,
             description,
             is_available AS "isAvailable"
      FROM products
      WHERE ($1::text IS NULL OR category = $1)
      ORDER BY id;
    `;
    const result = await pool.query(query, [category || null]);
    return result.rows;
  },

  async update(id, data) {
    const { productName, category, price, description, isAvailable } = data;
    const result = await pool.query(
      `UPDATE products
       SET product_name = $1, category = $2, price = $3, description = $4, is_available = $5
       WHERE id = $6
       RETURNING id`,
      [productName, category, price, description, isAvailable, id]
    );
    return result.rows[0];
  },

  async setAvailability(id, isAvailable) {
    const result = await pool.query(
      `UPDATE products SET is_available = $2 WHERE id = $1
       RETURNING id, is_available AS "isAvailable"`,
      [id, isAvailable]
    );
    return result.rows[0];
  },

  // ¿El platillo está en alguna orden abierta (activa o lista para entrega)?
  async isInOpenOrder(id) {
    const result = await pool.query(
      `SELECT EXISTS (
         SELECT 1 FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE oi.product_id = $1 AND o.status = ANY($2::text[])
       ) AS "inUse"`,
      [id, OPEN_ORDER_STATUSES]
    );
    return result.rows[0].inUse;
  },

  async getTopSelling() {
    const query = `
      SELECT 
        p.id,
        p.product_name AS "productName",
        p.category,
        p.price::float AS price,
        p.description,
        p.is_available AS "isAvailable",
        COALESCE(SUM(CASE WHEN o.status != 'cancelada' THEN oi.quantity ELSE 0 END), 0)::int AS "totalSold"
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id
      GROUP BY p.id, p.product_name, p.category, p.price, p.description, p.is_available
      ORDER BY "totalSold" DESC, p.id ASC
      LIMIT 4;
    `;
    const result = await pool.query(query);
    return result.rows;
  },
};