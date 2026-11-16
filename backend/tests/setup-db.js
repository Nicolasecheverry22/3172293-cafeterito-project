// Recrea desde cero la base de PRUEBAS y aplica todas las migraciones.
// Uso: npm run test:setup
//
// Se recrea (DROP + migrate) porque database/migrate.js no lleva registro de las
// migraciones aplicadas y 0028_update_groups_roles.sql no es idempotente:
// una segunda ejecución sobre la misma base falla.
//
// SEGURIDAD: solo actúa sobre bases cuyo nombre termina en "_test".

import pkg from "pg";
import dotenv from "dotenv";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const { Client } = pkg;

const TEST_DB = process.env.TEST_DB_NAME || "cafeterito_test";
if (!/^[a-z0-9_]+_test$/.test(TEST_DB)) {
  console.error(`Abortado: "${TEST_DB}" no parece una base de pruebas (debe terminar en _test).`);
  process.exit(1);
}

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "postgres",
});
await client.connect();
await client.query(`DROP DATABASE IF EXISTS "${TEST_DB}" WITH (FORCE)`);
await client.end();
console.log(`Base "${TEST_DB}" eliminada (si existía). Aplicando migraciones...`);

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(process.execPath, ["database/migrate.js"], {
  cwd: backendDir,
  env: { ...process.env, DB_NAME: TEST_DB },
  stdio: "inherit",
});
process.exit(result.status ?? 1);
