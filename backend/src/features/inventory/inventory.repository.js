import { pool } from "../../config/db.js";
import { createFilters, runList, likePattern, alpha } from "../../utils/listQuery.js";

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
  p.provider_name AS "providerName",
  i.provision_image_thumb AS "provisionImageThumb"
`;
// La imagen completa solo se devuelve en el detalle; los listados llevan la miniatura.
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
          barcode, expiration_date, provider_id, provision_image, provision_image_thumb)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [...values(data), data.provisionImage, data.provisionImageThumb ?? null]
    );
    return result.rows[0];
  },

  // Filtros opcionales: ?search (nombre/lote/código de barras), ?category, ?status,
  // ?providerId, ?page&limit. Orden alfabético por nombre y luego lote.
  async list({ search, category, status, providerId, page, limit } = {}) {
    const filters = createFilters();
    if (search) {
      filters.add("(i.provision_name ILIKE $? OR i.batch ILIKE $? OR i.barcode ILIKE $?)", likePattern(search));
    }
    if (category) filters.add("lower(i.category) = lower($?)", category);
    if (status) filters.add("i.status = $?", status);
    if (providerId) filters.add("i.provider_id = $?", providerId);
    return runList({
      select: INVENTORY_COLUMNS,
      from: FROM_INVENTORY,
      filters,
      orderBy: `${alpha("i.provision_name")}, i.batch, i.id`,
      page,
      limit,
    });
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT ${INVENTORY_COLUMNS}, i.provision_image AS "provisionImage"
       ${FROM_INVENTORY} WHERE i.id = $1`,
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
  // Sin imagen nueva se conserva la actual (COALESCE); el insumo no puede quedar sin imagen.
  async update(id, data) {
    const result = await pool.query(
      `UPDATE inventory
       SET provision_name = $1, category = $2, unit = $3, stock = $4, price = $5,
           batch = $6, min_stock = $7, max_stock = $8, status = $9,
           barcode = $10, expiration_date = $11, provider_id = $12,
           provision_image       = COALESCE($14::text, provision_image),
           provision_image_thumb = COALESCE($15::text, provision_image_thumb)
       WHERE id = $13
       RETURNING id`,
      [...values(data), id, data.provisionImage ?? null, data.provisionImageThumb ?? null]
    );
    return result.rows[0];
  },

  async setStatus(id, status) {
    const result = await pool.query(
      "UPDATE inventory SET status = $2 WHERE id = $1 RETURNING id, status",
      [id, status]
    );
    return result.rows[0];
  },
};
