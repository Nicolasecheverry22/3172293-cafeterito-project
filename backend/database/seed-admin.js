// Crea el usuario administrador inicial.
// Uso: npm run seed:admin   (desde la carpeta backend)
//
// Lee ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_NAME de .env. La contraseña debe cumplir
// la política RNF10. Si ya existe un usuario con ese correo, no hace nada.
// Se puede apuntar a otra base con DB_NAME=<base> en el entorno (lo usan las pruebas).

import "dotenv/config";
import bcrypt from "bcrypt";
import pkg from "pg";
import { pathToFileURL } from "node:url";
import { passwordProblems } from "../src/utils/passwordPolicy.js";

const { Client } = pkg;

export async function seedAdmin({
  email = process.env.ADMIN_EMAIL,
  password = process.env.ADMIN_PASSWORD,
  name = process.env.ADMIN_NAME,
  database = process.env.DB_NAME,
  log = console.log,
} = {}) {
  const missing = [
    !email && "ADMIN_EMAIL",
    !password && "ADMIN_PASSWORD",
    !name && "ADMIN_NAME",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
  }

  const problems = passwordProblems(password);
  if (problems.length) {
    throw new Error(`ADMIN_PASSWORD no cumple la política de contraseñas: ${problems.join("; ")}`);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
  });
  await client.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id FROM users WHERE lower(user_email) = $1",
      [normalizedEmail]
    );
    if (existing.rowCount > 0) {
      await client.query("ROLLBACK");
      log(`El usuario ${normalizedEmail} ya existe. No se hizo ningún cambio.`);
      return { id: existing.rows[0].id, created: false };
    }

    const group = await client.query(
      "SELECT group_id FROM groups WHERE group_name = 'Administrador'"
    );
    if (group.rowCount === 0) {
      throw new Error('No existe el grupo "Administrador". Ejecuta primero: npm run migrate');
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      `INSERT INTO users (user_name, user_email, user_password, is_staff, is_active, is_superuser)
       VALUES ($1, $2, $3, TRUE, TRUE, TRUE)
       RETURNING id`,
      [name.trim(), normalizedEmail, hash]
    );
    await client.query(
      "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)",
      [rows[0].id, group.rows[0].group_id]
    );

    await client.query("COMMIT");
    log(`Administrador ${normalizedEmail} creado (id ${rows[0].id}).`);
    return { id: rows[0].id, created: true };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

// Ejecución directa por CLI (no cuando se importa desde las pruebas)
const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  seedAdmin().catch((err) => {
    console.error(`Error creando el administrador: ${err.message}`);
    process.exit(1);
  });
}
