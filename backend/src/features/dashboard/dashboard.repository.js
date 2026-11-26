// Consultas del tablero de turno (GET /api/dashboard). Todas parametrizadas; ninguna lee
// imágenes completas (solo *_thumb).
//
// Zona horaria — todo se compara como TIMESTAMPTZ (un instante):
//  - invoices.created_at es TIMESTAMPTZ: ya es un instante, se usa tal cual.
//  - orders.created_at es TIMESTAMP sin zona, lleno con DEFAULT NOW() en una sesión con
//    TimeZone = America/Bogota: guarda la hora de pared de Bogotá. `created_at AT TIME ZONE $tz`
//    lo convierte en el instante correcto.
//  - Inicio de "hoy": date_trunc('day', now() AT TIME ZONE $tz) es la medianoche de Bogotá
//    (hora de pared) y `... AT TIME ZONE $tz` la vuelve instante. Así una venta de las
//    7:30 p. m. (00:30 UTC del día siguiente) cae en el día correcto, sin depender de la
//    zona del servidor de Node ni de la sesión.
//  - Horas del gráfico: EXTRACT(HOUR FROM created_at AT TIME ZONE $tz) = hora de Bogotá.
import { pool } from "../../config/db.js";
import { OPEN_ORDER_STATUSES } from "../orders/order.constants.js";

export const DASHBOARD_TZ = "America/Bogota";

// Límites del día en Bogotá ($1 = zona). Colombia no tiene horario de verano, así que
// "ayer a esta hora" es exactamente now() - 1 día.
const BOUNDS = `
  bounds AS (
    SELECT
      date_trunc('day', now() AT TIME ZONE $1) AT TIME ZONE $1                      AS today_start,
      (date_trunc('day', now() AT TIME ZONE $1) - INTERVAL '1 day') AT TIME ZONE $1 AS yesterday_start,
      now() - INTERVAL '1 day'                                                      AS yesterday_now
  )`;

// Minutos transcurridos desde orders.created_at (hora de pared de Bogotá)
const MINUTES_SINCE = (col) =>
  `FLOOR(EXTRACT(EPOCH FROM (now() - (${col} AT TIME ZONE $1))) / 60)::int`;

// Alertas de inventario ($1 = zona, $2 = días hasta el vencimiento). Compartido por el
// tablero (listado) y los badges de navegación (conteo): un solo criterio de "alerta".
const INVENTORY_ALERTS = `
  today AS (SELECT (now() AT TIME ZONE $1)::date AS d),
  alerts AS (
    SELECT i.id,
           i.provision_name AS name,
           i.stock,
           i.min_stock      AS "minStock",
           i.unit,
           i.status,
           TO_CHAR(i.expiration_date, 'YYYY-MM-DD') AS "expirationDate",
           (i.expiration_date - t.d)                AS "daysToExpire",
           CASE
             WHEN i.status = 'Agotado' THEN 'agotado'
             WHEN i.status = 'Vencido' OR i.expiration_date < t.d THEN 'vencido'
             WHEN i.stock <= i.min_stock THEN 'bajo_minimo'
             ELSE 'por_vencer'
           END AS type
      FROM inventory i, today t
     WHERE i.stock <= i.min_stock
        OR i.status IN ('Agotado', 'Vencido')
        OR (i.expiration_date IS NOT NULL AND i.expiration_date <= t.d + $2::int)
  )`;

const rows = async (sql, params) => (await pool.query(sql, params)).rows;

export const dashboardRepository = {
  async getUser(userId) {
    const [user] = await rows(
      `SELECT u.user_name AS name,
              u.user_image_thumb AS "imageThumb",
              COALESCE(
                (SELECT ARRAY_AGG(g.group_name ORDER BY g.group_name)
                   FROM user_groups ug JOIN groups g ON g.group_id = ug.group_id
                  WHERE ug.user_id = u.id),
                '{}'
              ) AS groups
         FROM users u
        WHERE u.id = $1`,
      [userId]
    );
    return user;
  },

  // Ventas de hoy y de ayer hasta esta misma hora (solo comprobantes emitidos)
  async getSalesKpis() {
    const [kpis] = await rows(
      `WITH ${BOUNDS}
       SELECT
         COALESCE(SUM(i.total) FILTER (WHERE i.created_at >= b.today_start), 0)::float AS "salesToday",
         COUNT(*) FILTER (WHERE i.created_at >= b.today_start)::int                    AS "invoicesToday",
         COALESCE(SUM(i.total) FILTER (
           WHERE i.created_at >= b.yesterday_start AND i.created_at < b.yesterday_now
         ), 0)::float                                                                  AS "salesYesterday"
       FROM bounds b
       LEFT JOIN invoices i
              ON i.status = 'emitida' AND i.created_at >= b.yesterday_start`,
      [DASHBOARD_TZ]
    );
    return kpis;
  },

  async getOpenOrderCounts() {
    const [counts] = await rows(
      `SELECT COUNT(*)::int                                            AS total,
              COUNT(*) FILTER (WHERE status = 'activa')::int             AS active,
              COUNT(*) FILTER (WHERE status = 'lista para entrega')::int AS ready
         FROM orders
        WHERE status = ANY($1)`,
      [OPEN_ORDER_STATUSES]
    );
    return counts;
  },

  async getTableCount() {
    const [row] = await rows("SELECT table_count AS \"tableCount\" FROM restaurant_settings WHERE id");
    return row?.tableCount ?? 0;
  },

  // Órdenes abiertas (para el mapa de mesas, por cobrar y "mis órdenes").
  // waiterId opcional: solo las del mesero.
  async getOpenOrders({ waiterId = null } = {}) {
    return rows(
      `SELECT s.id                   AS "orderId",
              s.table_number         AS "tableNumber",
              s.status,
              s.waiter_id            AS "waiterId",
              s.waiter_name          AS "waiterName",
              s.total::float         AS total,
              ${MINUTES_SINCE("s.created_at")} AS minutes
         FROM orders_summary s
        WHERE s.status = ANY($2)
          AND ($3::int IS NULL OR s.waiter_id = $3)
        ORDER BY (s.status = 'lista para entrega') DESC, s.created_at ASC`,
      [DASHBOARD_TZ, OPEN_ORDER_STATUSES, waiterId]
    );
  },

  // Cola de cocina: órdenes activas de la más antigua a la más nueva, con sus platillos.
  // Incluye productId y waiterId para armar el PUT de "Marcar lista" sin otra consulta.
  async getKitchenQueue(limit = 15) {
    return rows(
      `SELECT o.id                    AS "orderId",
              o.table_number          AS "tableNumber",
              o.waiter_id             AS "waiterId",
              u.user_name             AS "waiterName",
              o.observations,
              ${MINUTES_SINCE("o.created_at")} AS minutes,
              COALESCE(
                json_agg(
                  json_build_object('productId', oi.product_id, 'name', p.product_name, 'quantity', oi.quantity)
                  ORDER BY oi.id
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
         FROM orders o
         LEFT JOIN users u        ON u.id = o.waiter_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN products p     ON p.id = oi.product_id
        WHERE o.status = 'activa'
        GROUP BY o.id, u.user_name
        ORDER BY o.created_at ASC, o.id ASC
        LIMIT $2`,
      [DASHBOARD_TZ, limit]
    );
  },

  // Totales de hoy por método de pago. cashierId opcional: solo sus comprobantes.
  async getPaymentBreakdown({ cashierId = null } = {}) {
    return rows(
      `WITH ${BOUNDS}
       SELECT i.payment_method      AS method,
              COUNT(*)::int         AS count,
              SUM(i.total)::float   AS total
         FROM invoices i, bounds b
        WHERE i.status = 'emitida'
          AND i.created_at >= b.today_start
          AND ($2::int IS NULL OR i.cashier_id = $2)
        GROUP BY i.payment_method`,
      [DASHBOARD_TZ, cashierId]
    );
  },

  async getSalesByHour() {
    return rows(
      `WITH ${BOUNDS}
       SELECT EXTRACT(HOUR FROM i.created_at AT TIME ZONE $1)::int AS hour,
              COUNT(*)::int                                       AS count,
              SUM(i.total)::float                                 AS total
         FROM invoices i, bounds b
        WHERE i.status = 'emitida' AND i.created_at >= b.today_start
        GROUP BY 1
        ORDER BY 1`,
      [DASHBOARD_TZ]
    );
  },

  // Alertas: stock <= mínimo, Agotado/Vencido, o vence en los próximos `days` días
  // (incluye los ya vencidos por fecha aunque su estado siga "Disponible").
  async getInventoryAlerts({ limit = 8, days = 3 } = {}) {
    return rows(
      `WITH ${INVENTORY_ALERTS}
       SELECT a.*,
              CASE WHEN a.type IN ('agotado', 'vencido') THEN 'error' ELSE 'warning' END AS severity,
              COUNT(*) OVER ()::int AS "totalAlerts"
         FROM alerts a
        ORDER BY (a.type IN ('agotado', 'vencido')) DESC, a."daysToExpire" ASC NULLS LAST,
                 (a.stock - a."minStock") ASC, a.id ASC
        LIMIT $3`,
      [DASHBOARD_TZ, days, limit]
    );
  },

  // Solo el total de alertas (mismo criterio que getInventoryAlerts), para los badges
  async countInventoryAlerts({ days = 3 } = {}) {
    const [row] = await rows(`WITH ${INVENTORY_ALERTS} SELECT COUNT(*)::int AS total FROM alerts`, [
      DASHBOARD_TZ,
      days,
    ]);
    return row.total;
  },

  // Top de platillos vendidos (comprobantes emitidos) desde el inicio de hoy menos `daysBack` días
  async getTopProducts({ daysBack = 0, limit = 5 } = {}) {
    return rows(
      `WITH ${BOUNDS}
       SELECT ii.product_id               AS "productId",
              COALESCE(p.product_name, MAX(ii.product_name)) AS name,
              p.product_image_thumb        AS "imageThumb",
              SUM(ii.quantity)::int        AS quantity,
              SUM(ii.line_total)::float    AS total
         FROM invoice_items ii
         JOIN invoices i     ON i.id = ii.invoice_id
         LEFT JOIN products p ON p.id = ii.product_id
         CROSS JOIN bounds b
        WHERE i.status = 'emitida'
          AND i.created_at >= b.today_start - make_interval(days => $2::int)
        GROUP BY ii.product_id, p.product_name, p.product_image_thumb
        ORDER BY quantity DESC, total DESC
        LIMIT $3`,
      [DASHBOARD_TZ, daysBack, limit]
    );
  },
};
