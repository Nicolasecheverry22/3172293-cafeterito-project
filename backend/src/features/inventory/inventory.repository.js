import { pool } from "../../config/db.js";

// Columnas devueltas al frontend (alias en camelCase)
const INVENTORY_COLUMNS = `
  i.id,
  i.provision_name AS "provisionName",
  i.category,
  i.unit,
  i.stock,
  i.price::float AS price,
  i.batch,
  i.min_stock AS "minStock",
  i.max_stock AS "maxStock",
  i.status,
  i.barcode,
  TO_CHAR(i.expiration_date, 'YYYY-MM-DD') AS "expirationDate",
  i.provider_id AS "providerId",
  p.provider_name AS "providerName"
`;
const FROM_INVENTORY = `FROM inventory i LEFT JOIN providers p ON p.id = i.provider_id`;

const values = (data) => [
  data.provisionName, data.category, data.unit, data.stock, data.price,
  data.batch, data.minStock, data.maxStock, data.status,
  data.barcode, data.expirationDate ?? null, data.providerId ?? null,
];

// Consultas SQL del recurso inventory (suministros).
export const inventoryRepository = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO inventory
         (provision_name, category, unit, stock, price, batch, min_stock, max_stock, status,
          barcode, expiration_date, provider_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      values(data)
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query(`SELECT ${INVENTORY_COLUMNS} ${FROM_INVENTORY} ORDER BY i.id`);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT ${INVENTORY_COLUMNS} ${FROM_INVENTORY} WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async getReportData(category, status) {
    const result = await pool.query(
      `SELECT ${INVENTORY_COLUMNS} ${FROM_INVENTORY}
       WHERE ($1::text IS NULL OR i.category = $1)
         AND ($2::text IS NULL OR i.status = $2)
       ORDER BY i.id`,
      [category || null, status || null]
    );
    return result.rows;
  },

  // Actualiza todos los campos editables. Retorna undefined si el id no existe.
  async update(id, data) {
    const result = await pool.query(
      `UPDATE inventory
       SET provision_name = $1, category = $2, unit = $3, stock = $4, price = $5,
           batch = $6, min_stock = $7, max_stock = $8, status = $9,
           barcode = $10, expiration_date = $11, provider_id = $12
       WHERE id = $13
       RETURNING id`,
      [...values(data), id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query("DELETE FROM inventory WHERE id = $1 RETURNING id", [id]);
    return result.rows[0];
  },
};
