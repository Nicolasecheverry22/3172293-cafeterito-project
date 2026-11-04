// Runner de migraciones.
// 1. Crea la base de datos (DB_NAME) si todavia no existe.
// 2. Ejecuta, en orden alfabetico, todos los archivos .sql de la carpeta /migrations.
//
// Uso:  npm run migrate   (desde la carpeta backend)

import pkg from "pg";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Client } = pkg;

// Cargamos las variables de entorno definidas en .env
dotenv.config();

// Resolvemos la ruta a la carpeta de migraciones (compatible con ES modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "migrations");

// Datos de conexion reutilizables
const connection = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const dbName = process.env.DB_NAME;

// Crea la base de datos si no existe.
// CREATE DATABASE no admite "IF NOT EXISTS" ni correr dentro de otra BD destino,
// por eso nos conectamos a la base por defecto 'postgres' y consultamos primero.
async function ensureDatabase() {
    const client = new Client({ ...connection, database: "postgres" });
    await client.connect();
    try {
        const { rowCount } = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );
        if (rowCount === 0) {
            // El nombre no puede ir parametrizado en CREATE DATABASE.
            // Lo citamos con comillas dobles para evitar problemas de sintaxis.
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Base de datos "${dbName}" creada.`);
        } else {
            console.log(`Base de datos "${dbName}" ya existe.`);
        }
    } finally {
        await client.end();
    }
}

// Ejecuta en orden todos los archivos .sql de la carpeta migrations.
async function runMigrations() {
    const client = new Client({ ...connection, database: dbName });
    await client.connect();
    try {
        const files = fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith(".sql"))
            .sort();

        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
            console.log(`Ejecutando migracion: ${file}`);
            await client.query(sql);
        }
        console.log("Migraciones aplicadas correctamente.");
    } finally {
        await client.end();
    }
}

async function main() {
    await ensureDatabase();
    await runMigrations();
}

main().catch((err) => {
    console.error("Error ejecutando las migraciones:", err);
    process.exit(1);
});
