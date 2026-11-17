// Runner de migraciones.
//
//   npm run migrate                 Aplica las migraciones pendientes.
//   npm run migrate -- --baseline   Registra como aplicadas (SIN ejecutarlas) las
//                                   migraciones cuyos objetos ya existen en una base
//                                   creada antes de que existiera schema_migrations.
//
// Funcionamiento:
// 1. Crea la base de datos (DB_NAME) si no existe.
// 2. Crea la tabla schema_migrations(filename, applied_at) si no existe.
// 3. Ejecuta en orden alfabético los .sql de /migrations que no estén registrados,
//    cada uno en su propia transacción. Se detiene en el primer error indicando el archivo.
//
// Ver database/README.md para el procedimiento con bases existentes.

import pkg from "pg";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DETECTORS } from "./migration-detectors.js";

const { Client } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "migrations");

const connection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
const dbName = process.env.DB_NAME;
const BASELINE = process.argv.includes("--baseline");

const listMigrationFiles = () =>
  fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

// CREATE DATABASE no admite "IF NOT EXISTS": se consulta primero desde la base 'postgres'.
async function ensureDatabase() {
  const client = new Client({ ...connection, database: "postgres" });
  await client.connect();
  try {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (rowCount === 0) {
      // El nombre no puede ir parametrizado; viene de .env, no del usuario.
      await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`Base de datos "${dbName}" creada.`);
    } else {
      console.log(`Base de datos "${dbName}" ya existe.`);
    }
  } finally {
    await client.end();
  }
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
}

async function getApplied(client) {
  const { rows } = await client.query("SELECT filename FROM schema_migrations");
  return new Set(rows.map((r) => r.filename));
}

// Una base "heredada" tiene tablas del proyecto pero ninguna migración registrada.
async function isLegacyDatabase(client, applied) {
  if (applied.size > 0) return false;
  const { rows } = await client.query("SELECT to_regclass('public.users') IS NOT NULL AS exists");
  return rows[0].exists;
}

async function runMigrations(client) {
  const applied = await getApplied(client);

  if (await isLegacyDatabase(client, applied)) {
    throw new Error(
      `La base "${dbName}" ya tiene tablas pero ninguna migración registrada en schema_migrations.\n` +
        "Ejecuta primero:  npm run migrate -- --baseline\n" +
        "(ver database/README.md)"
    );
  }

  const pending = listMigrationFiles().filter((f) => !applied.has(f));
  if (pending.length === 0) {
    console.log("No hay migraciones pendientes.");
    return;
  }

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Aplicando migración: ${file}`);
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      err.message = `Falló la migración ${file}: ${err.message}`;
      throw err;
    }
  }
  console.log(`${pending.length} migración(es) aplicadas correctamente.`);
}

// Registra sin ejecutar las migraciones cuyos objetos ya existen.
async function runBaseline(client) {
  const applied = await getApplied(client);
  const registered = [];
  const pending = [];

  for (const file of listMigrationFiles()) {
    if (applied.has(file)) continue;

    const detector = DETECTORS[file];
    if (!detector) {
      pending.push(`${file} (sin detector: se ejecutará con npm run migrate)`);
      continue;
    }

    let isApplied = false;
    try {
      const { rows } = await client.query(`SELECT (${detector}) AS applied`);
      isApplied = rows[0].applied === true;
    } catch {
      // Si el detector falla (p. ej. la tabla aún no existe) la migración no está aplicada
      isApplied = false;
    }

    if (isApplied) {
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
        [file]
      );
      registered.push(file);
    } else {
      pending.push(file);
    }
  }

  console.log(`Baseline: ${registered.length} migración(es) registradas como ya aplicadas.`);
  registered.forEach((f) => console.log(`  ✔ ${f}`));
  if (pending.length) {
    console.log(`Pendientes (NO registradas, se aplicarán con "npm run migrate"):`);
    pending.forEach((f) => console.log(`  • ${f}`));
  } else {
    console.log("No quedan migraciones pendientes.");
  }
}

async function main() {
  if (!dbName) throw new Error("Falta la variable de entorno DB_NAME");
  await ensureDatabase();

  const client = new Client({ ...connection, database: dbName });
  await client.connect();
  try {
    await ensureMigrationsTable(client);
    if (BASELINE) {
      await runBaseline(client);
    } else {
      await runMigrations(client);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(`Error ejecutando las migraciones: ${err.message}`);
  process.exit(1);
});
