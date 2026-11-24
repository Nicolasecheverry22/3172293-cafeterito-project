import { pool } from "../../config/db.js";
import { createFilters, runList, likePattern, alpha } from "../../utils/listQuery.js";

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
  is_active,
  provider_image_thumb AS "providerImageThumb"
`;
// El logo completo solo se devuelve en el detalle; los listados llevan la miniatura.

// Consultas SQL del recurso providers (proveedores).
export const providerRepository = {
  async create(data) {
    const {
      documentType, nit, providerName, providerEmail,
      providerPhone, providerAddress, productService, isActive,
      providerImage, providerImageThumb,
    } = data;
    const result = await pool.query(
      `INSERT INTO providers
         (document_type, nit, provider_name, provider_email, provider_phone,
          provider_address, product_service, is_active, provider_image, provider_image_thumb)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        documentType, nit, providerName, providerEmail, providerPhone,
        providerAddress ?? null, productService ?? null, isActive ?? true,
        providerImage ?? null, providerImageThumb ?? null,
      ]
    );
    return result.rows[0];
  },

  // Filtros opcionales: ?search (nombre/NIT/correo), ?nit (exacto), ?documentType,
  // ?isActive, ?page&limit. Orden alfabético por nombre.
  async list({ search, nit, documentType, isActive, page, limit } = {}) {
    const filters = createFilters();
    if (search) {
      filters.add("(provider_name ILIKE $? OR nit ILIKE $? OR provider_email ILIKE $?)", likePattern(search));
    }
    if (nit) filters.add("nit = $?", nit);
    if (documentType) filters.add("document_type = $?", documentType);
    if (isActive !== undefined) filters.add("is_active = $?", isActive);
    return runList({
      select: PROVIDER_COLUMNS,
      from: "FROM providers",
      filters,
      orderBy: `${alpha("provider_name")}, id`,
      page,
      limit,
    });
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT ${PROVIDER_COLUMNS}, provider_image AS "providerImage" FROM providers WHERE id = $1`,
      [id]
    );
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
      providerImage, providerImageThumb, removeImage,
    } = data;
    // Logo: nuevo → se reemplaza; sin logo → se conserva (COALESCE); removeImage → NULL
    const result = await pool.query(
      `UPDATE providers
       SET document_type = $1, nit = $2, provider_name = $3, provider_email = $4,
           provider_phone = $5, provider_address = $6, product_service = $7, is_active = $8,
           provider_image       = CASE WHEN $12::boolean AND $10::text IS NULL THEN NULL
                                       ELSE COALESCE($10::text, provider_image) END,
           provider_image_thumb = CASE WHEN $12::boolean AND $10::text IS NULL THEN NULL
                                       ELSE COALESCE($11::text, provider_image_thumb) END
       WHERE id = $9
       RETURNING id`,
      [
        documentType, nit, providerName, providerEmail, providerPhone,
        providerAddress ?? null, productService ?? null, isActive, id,
        providerImage ?? null, providerImageThumb ?? null, Boolean(removeImage),
      ]
    );
    return result.rows[0];
  },

  async setStatus(id, isActive) {
    const result = await pool.query(
      "UPDATE providers SET is_active = $2 WHERE id = $1 RETURNING id, is_active",
      [id, isActive]
    );
    return result.rows[0];
  },
};
