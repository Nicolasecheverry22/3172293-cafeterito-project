import { pool } from "../../config/db.js";
import { OPEN_ORDER_STATUSES, FINAL_ORDER_STATUSES } from "./order.constants.js";
import { createFilters, runList } from "../../utils/listQuery.js";

const ORDER_COLUMNS = `
    o.id,
    o.table_number                      AS "tableNumber",
    o.waiter_id                         AS "waiterId",
    COALESCE(u.user_name, 'Sin asignar') AS waiter,
    o.status,
    o.observations,
    TO_CHAR(o.created_at, 'YYYY-MM-DD')  AS "createdAt",
    COALESCE(SUM(oi.quantity * oi.unit_price), 0)::float AS total,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id',        oi.id,
          'productId',  oi.product_id,
          'dish',      p.product_name,
          'quantity',   oi.quantity,
          'price',      oi.unit_price::float,
          'dispatched', oi.is_dispatched
        ) ORDER BY oi.id
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'
    ) AS items
`;
const ORDER_FROM = `
  FROM orders o
  LEFT JOIN users u        ON u.id = o.waiter_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p     ON p.id = oi.product_id
`;
const ORDER_SELECT = `SELECT ${ORDER_COLUMNS} ${ORDER_FROM}`;

export const orderRepository = {
  // Filtros opcionales: ?status, ?tableNumber, ?from, ?to (AAAA-MM-DD), ?page&limit.
  // Orden: más recientes primero.
  async list({ status, tableNumber, from, to, page, limit } = {}) {
    const filters = createFilters();
    if (status) filters.add("o.status = $?", status);
    if (tableNumber) filters.add("o.table_number = $?", tableNumber);
    if (from) filters.add("o.created_at >= $?::date", from);
    if (to) filters.add("o.created_at < ($?::date + 1)", to);
    return runList({
      select: ORDER_COLUMNS,
      from: ORDER_FROM,
      filters,
      groupBy: "GROUP BY o.id, u.user_name",
      orderBy: "o.created_at DESC, o.id DESC",
      page,
      limit,
    });
  },

  async getById(id) {
    const query = `${ORDER_SELECT} WHERE o.id = $1 GROUP BY o.id, u.user_name;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getReportData(tableNumber) {
    const query = `
      ${ORDER_SELECT}
      WHERE ($1::int IS NULL OR o.table_number = $1)
      GROUP BY o.id, u.user_name
      ORDER BY o.id;
    `;
    const result = await pool.query(query, [tableNumber || null]);
    return result.rows;
  },

  async getProductsByIds(productIds) {
    const result = await pool.query(
      `SELECT id, product_name, price, is_available
       FROM products
       WHERE id = ANY($1::int[])`,
      [productIds]
    );
    return result.rows;
  },

  async create({ tableNumber, waiterId, observations }, items) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO orders (table_number, waiter_id, observations)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [tableNumber, waiterId, observations]
      );
      const orderId = rows[0].id;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         SELECT $1, t.product_id, t.quantity, t.unit_price
         FROM unnest($2::int[], $3::int[], $4::numeric[])
              AS t(product_id, quantity, unit_price)`,
        [
          orderId,
          items.map((i) => i.productId),
          items.map((i) => i.quantity),
          items.map((i) => i.unitPrice),
        ]
      );

      await client.query("COMMIT");
      return { id: orderId };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, { tableNumber, waiterId, status, observations }, items) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `UPDATE orders
         SET table_number = $1, waiter_id = $2, status = $3,
             observations = $4, updated_at = NOW()
         WHERE id = $5 AND status <> ALL($6::text[])
         RETURNING id`,
        [tableNumber, waiterId, status, observations, id, FINAL_ORDER_STATUSES]
      );

      if (!rows[0]) {
        await client.query("ROLLBACK");
        return undefined;
      }

      await client.query("DELETE FROM order_items WHERE order_id = $1", [id]);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, is_dispatched)
         SELECT $1, t.product_id, t.quantity, t.unit_price, t.is_dispatched
         FROM unnest($2::int[], $3::int[], $4::numeric[], $5::boolean[])
              AS t(product_id, quantity, unit_price, is_dispatched)`,
        [
          id,
          items.map((i) => i.productId),
          items.map((i) => i.quantity),
          items.map((i) => i.unitPrice),
          items.map((i) => i.dispatched),
        ]
      );

      await client.query("COMMIT");
      return rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Anula la orden solo si sigue abierta (la condición en el WHERE evita carreras).
  async cancel(id) {
    const result = await pool.query(
      `UPDATE orders SET status = 'cancelada', updated_at = NOW()
       WHERE id = $1 AND status = ANY($2::text[])
       RETURNING id, status`,
      [id, OPEN_ORDER_STATUSES]
    );
    return result.rows[0];
  },
};