import { pool } from "../../config/db.js";
import { settingsRepository } from "./settings.repository.js";
import { httpError } from "../../utils/httpError.js";

export const settingsService = {
  async get() {
    return await settingsRepository.get();
  },

  // No se puede reducir el total si una mesa que desaparecería tiene una orden abierta.
  // Transacción + bloqueo de la fila: dos administradores no pisan el cambio del otro.
  async update({ tableCount }, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT 1 FROM restaurant_settings WHERE id FOR UPDATE");

      const blocked = await settingsRepository.openTablesAbove(tableCount, client);
      if (blocked.length) {
        throw httpError(
          409,
          `No se puede reducir a ${tableCount} mesas: ${blocked.length === 1 ? "la mesa" : "las mesas"} ` +
            `${blocked.join(", ")} ${blocked.length === 1 ? "tiene" : "tienen"} una orden abierta`
        );
      }

      await settingsRepository.updateTableCount(tableCount, userId, client);
      const settings = await settingsRepository.get(client);
      await client.query("COMMIT");
      return settings;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
