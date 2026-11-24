import { pool } from "../../config/db.js";
import { createFilters, runList, likePattern } from "../../utils/listQuery.js";

// Montos como float (igual que orders) para que el frontend reciba números.
const INVOICE_COLUMNS = `
    i.id,
    i.invoice_number                AS "invoiceNumber",
    i.order_id                      AS "orderId",
    i.table_number                  AS "tableNumber",
    i.created_at                    AS "createdAt",
    i.cashier_id                    AS "cashierId",
    COALESCE(c.user_name, 'Sin registro') AS cashier,
    i.waiter_id                     AS "waiterId",
    COALESCE(w.user_name, 'Sin asignar')  AS waiter,
    i.customer_name                 AS "customerName",
    i.customer_document_type        AS "customerDocumentType",
    i.customer_document             AS "customerDocument",
    i.payment_method                AS "paymentMethod",
    i.subtotal::float               AS subtotal,
    i.tax_rate::float               AS "taxRate",
    i.tax_amount::float             AS "taxAmount",
    i.tip::float                    AS tip,
    i.total::float                  AS total,
    i.amount_received::float        AS "amountReceived",
    i.change_given::float           AS "changeGiven",
    i.status,
    i.void_reason                   AS "voidReason",
    i.voided_by                     AS "voidedBy",
    v.user_name                     AS "voidedByName",
    i.voided_at                     AS "voidedAt"
`;
const INVOICE_FROM = `
  FROM invoices i
  LEFT JOIN users c ON c.id = i.cashier_id
  LEFT JOIN users w ON w.id = i.waiter_id
  LEFT JOIN users v ON v.id = i.voided_by
`;
const ITEMS_SUBQUERY = `
    COALESCE((
      SELECT JSON_AGG(JSON_BUILD_OBJECT(
               'id',          ii.id,
               'productId',   ii.product_id,
               'productName', ii.product_name,
               'quantity',    ii.quantity,
               'unitPrice',   ii.unit_price::float,
               'lineTotal',   ii.line_total::float
             ) ORDER BY ii.id)
      FROM invoice_items ii
      WHERE ii.invoice_id = i.id
    ), '[]') AS items
`;
const DETAIL_SELECT = `SELECT ${INVOICE_COLUMNS}, ${ITEMS_SUBQUERY} ${INVOICE_FROM}`;

// Filtros compartidos por el listado y el reporte. Fechas en AAAA-MM-DD (inclusive).
function buildFilters({ from, to, status, paymentMethod, cashierId, search } = {}) {
  const filters = createFilters();
  if (from) filters.add("i.created_at >= $?::date", from);
  if (to) filters.add("i.created_at < ($?::date + 1)", to);
  if (status) filters.add("i.status = $?", status);
  if (paymentMethod) filters.add("i.payment_method = $?", paymentMethod);
  if (cashierId) filters.add("i.cashier_id = $?", cashierId);
  if (search) {
    // Número de comprobante o cliente (contiene), o mesa exacta: '%5%' = '%' || 5 || '%'
    filters.add(
      `(i.invoice_number ILIKE $? OR i.customer_name ILIKE $? OR ('%' || i.table_number || '%') = $?)`,
      likePattern(search)
    );
  }
  return filters;
}

export const invoiceRepository = {
  // Ejecuta fn(client) dentro de BEGIN/COMMIT; ROLLBACK ante cualquier error.
  async withTransaction(fn) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  },

  // ── Dentro de la transacción de cobro ──────────────────────────
  // FOR UPDATE: un segundo cajero que cobre la misma orden espera aquí hasta el COMMIT
  // del primero y luego ve la orden ya 'pagada'.
  async lockOrder(client, orderId) {
    const { rows } = await client.query(
      `SELECT id, table_number AS "tableNumber", waiter_id AS "waiterId", status
       FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );
    return rows[0];
  },

  // Precio histórico de order_items; nombre vigente del platillo (se copia al comprobante)
  async getOrderItems(client, orderId) {
    const { rows } = await client.query(
      `SELECT oi.product_id AS "productId", p.product_name AS "productName",
              oi.quantity, oi.unit_price AS "unitPrice"
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [orderId]
    );
    return rows;
  },

  async insertInvoice(client, data) {
    const { rows } = await client.query(
      `INSERT INTO invoices (
         invoice_number, order_id, cashier_id, waiter_id, table_number,
         customer_name, customer_document_type, customer_document, payment_method,
         subtotal, tax_rate, tax_amount, tip, total, amount_received, change_given)
       VALUES ('CV-' || lpad(nextval('invoice_number_seq')::text, 6, '0'),
               $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, invoice_number AS "invoiceNumber"`,
      [
        data.orderId, data.cashierId, data.waiterId, data.tableNumber,
        data.customerName, data.customerDocumentType, data.customerDocument, data.paymentMethod,
        data.subtotal, data.taxRate, data.taxAmount, data.tip, data.total,
        data.amountReceived, data.changeGiven,
      ]
    );
    return rows[0];
  },

  async insertItems(client, invoiceId, items) {
    await client.query(
      `INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, line_total)
       SELECT $1, t.product_id, t.product_name, t.quantity, t.unit_price, t.line_total
       FROM unnest($2::int[], $3::text[], $4::int[], $5::numeric[], $6::numeric[])
            AS t(product_id, product_name, quantity, unit_price, line_total)`,
      [
        invoiceId,
        items.map((i) => i.productId),
        items.map((i) => i.productName),
        items.map((i) => i.quantity),
        items.map((i) => i.unitPrice),
        items.map((i) => i.lineTotal),
      ]
    );
  },

  async setOrderStatus(client, orderId, status) {
    await client.query("UPDATE orders SET status = $2, updated_at = now() WHERE id = $1", [orderId, status]);
  },

  // ── Anulación ──────────────────────────────────────────────────
  async lockInvoice(client, id) {
    const { rows } = await client.query(
      `SELECT id, order_id AS "orderId", status FROM invoices WHERE id = $1 FOR UPDATE`,
      [id]
    );
    return rows[0];
  },

  async markVoided(client, id, { reason, userId }) {
    await client.query(
      `UPDATE invoices
       SET status = 'anulada', void_reason = $2, voided_by = $3, voided_at = now()
       WHERE id = $1`,
      [id, reason, userId]
    );
  },

  // Rol Administrador (grupo activo) del usuario autenticado
  async isAdministrator(userId) {
    const { rows } = await pool.query(
      `SELECT EXISTS (
         SELECT 1 FROM user_groups ug
         JOIN groups g ON g.group_id = ug.group_id
         WHERE ug.user_id = $1 AND g.group_name = 'Administrador' AND g.is_active
       ) AS ok`,
      [userId]
    );
    return rows[0].ok;
  },

  // ── Consultas ──────────────────────────────────────────────────
  // Más recientes primero; paginación solo con ?page&limit (utils/listQuery.js)
  async list({ page, limit, ...query } = {}) {
    return runList({
      select: INVOICE_COLUMNS,
      from: INVOICE_FROM,
      filters: buildFilters(query),
      orderBy: "i.created_at DESC, i.id DESC",
      page,
      limit,
    });
  },

  async getById(id, db = pool) {
    const { rows } = await db.query(`${DETAIL_SELECT} WHERE i.id = $1`, [id]);
    return rows[0];
  },

  async getByOrderId(orderId) {
    const { rows } = await pool.query(`${DETAIL_SELECT} WHERE i.order_id = $1`, [orderId]);
    return rows[0];
  },

  // Filas del reporte + totales. Los montos agregados cuentan solo comprobantes 'emitida':
  // uno anulado no es una venta.
  async getReportData(query = {}) {
    const filters = buildFilters(query);
    const where = filters.where();
    const { params } = filters;
    const issued = `${where ? `${where} AND` : "WHERE"} i.status = 'emitida'`;

    const [list, summary, byMethod, byDay] = await Promise.all([
      pool.query(`SELECT ${INVOICE_COLUMNS} ${INVOICE_FROM} ${where} ORDER BY i.created_at, i.id`, params),
      pool.query(
        `SELECT count(*)::int AS count,
                count(*) FILTER (WHERE i.status = 'emitida')::int AS "issuedCount",
                count(*) FILTER (WHERE i.status = 'anulada')::int AS "voidedCount",
                COALESCE(SUM(i.total) FILTER (WHERE i.status = 'emitida'), 0)::float AS "totalSold",
                COALESCE(SUM(i.tax_amount) FILTER (WHERE i.status = 'emitida'), 0)::float AS "totalTax",
                COALESCE(SUM(i.tip) FILTER (WHERE i.status = 'emitida'), 0)::float AS "totalTips"
         FROM invoices i ${where}`,
        params
      ),
      pool.query(
        `SELECT i.payment_method AS "paymentMethod", count(*)::int AS count, SUM(i.total)::float AS total
         FROM invoices i ${issued}
         GROUP BY i.payment_method ORDER BY i.payment_method`,
        params
      ),
      pool.query(
        `SELECT TO_CHAR(i.created_at, 'YYYY-MM-DD') AS day, count(*)::int AS count, SUM(i.total)::float AS total
         FROM invoices i ${issued}
         GROUP BY 1 ORDER BY 1`,
        params
      ),
    ]);

    return {
      invoices: list.rows,
      totals: { ...summary.rows[0], byPaymentMethod: byMethod.rows, byDay: byDay.rows },
    };
  },
};
