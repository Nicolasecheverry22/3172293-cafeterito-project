import { pool } from "../../config/db.js";
import { OPEN_ORDER_STATUSES } from "../orders/order.constants.js";

const SETTINGS_COLUMNS = `
  s.table_count                              AS "tableCount",
  TO_CHAR(s.updated_at, 'YYYY-MM-DD HH24:MI') AS "updatedAt",
  u.user_name                                AS "updatedBy"
`;

export const settingsRepository = {
  async get(client = pool) {
    const { rows } = await client.query(
      `SELECT ${SETTINGS_COLUMNS}
         FROM restaurant_settings s
         LEFT JOIN users u ON u.id = s.updated_by
        WHERE s.id`
    );
    return rows[0];
  },

  // Mesas con orden abierta por encima del nuevo total (impiden reducirlo)
  async openTablesAbove(tableCount, client = pool) {
    const { rows } = await client.query(
      `SELECT DISTINCT table_number AS "tableNumber"
         FROM orders
        WHERE status = ANY($1) AND table_number > $2
        ORDER BY 1`,
      [OPEN_ORDER_STATUSES, tableCount]
    );
    return rows.map((r) => r.tableNumber);
  },

  async updateTableCount(tableCount, userId, client = pool) {
    await client.query(
      `UPDATE restaurant_settings
          SET table_count = $1, updated_at = NOW(), updated_by = $2
        WHERE id`,
      [tableCount, userId]
    );
  },
};
