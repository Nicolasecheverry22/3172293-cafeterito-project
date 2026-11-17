// Utilidades compartidas por la suite de pruebas funcionales.
//
// SEGURIDAD: la suite SIEMPRE usa una base de datos de prueba.
// - Toma el nombre de TEST_DB_NAME (por defecto "cafeterito_test").
// - Se niega a correr si el nombre no termina en "_test".
// - Todo dato creado lleva el prefijo TEST_ (o mesas >= 900) y se borra en cleanup().

const TEST_DB = process.env.TEST_DB_NAME || "cafeterito_test";
if (!/_test$/.test(TEST_DB)) {
  throw new Error(`Abortado: la base de pruebas debe terminar en "_test" (recibido "${TEST_DB}")`);
}
// Se fija ANTES de cargar .env: dotenv no sobrescribe variables ya definidas,
// así DB_NAME de .env nunca se usa en las pruebas.
process.env.DB_NAME = TEST_DB;
const { default: dotenv } = await import("dotenv");
dotenv.config({ quiet: true });
// JWT_SECRET / JWT_EXPIRES se toman de .env (se prueba la configuración real);
// solo se usan estos valores si .env no los define.
process.env.JWT_SECRET ||= "test_only_secret";
process.env.JWT_EXPIRES ||= "1h";

const { default: app } = await import("../src/app.js");
const { pool } = await import("../src/config/db.js");

export { pool };

export const PREFIX = "TEST_";
export const STRONG_PASSWORD = "Cafe#Test2026";
// Mesas reservadas para pruebas (se borran en cleanup)
export const TEST_TABLE_MIN = 900;

let server;
let baseUrl;

export async function startServer() {
  if (server) return baseUrl;
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  return baseUrl;
}

export async function stopServer() {
  if (server) await new Promise((resolve) => server.close(resolve));
  server = undefined;
  await pool.end();
}

// Cliente HTTP mínimo: devuelve { status, body, text, headers }
export async function api(method, path, { body, token, raw } = {}) {
  const headers = {};
  if (body !== undefined || raw !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }
  return { status: res.status, body: parsed, text, headers: res.headers };
}

let seq = 0;
// Genera datos únicos por ejecución
export const uid = () => `${Date.now().toString().slice(-7)}${++seq}`;
// Versión solo con letras (los nombres de usuario no admiten dígitos ni "_")
export const letters = (s) => String(s).replace(/\d/g, (d) => "abcdefghij"[d]);

export function userPayload(overrides = {}) {
  const id = uid();
  return {
    userName: `Test Usuario ${letters(id)}`,
    userEmail: `test_${id}@cafeterito.test`,
    userPhone: "3001234567",
    userDocumentTypes: "CC",
    userDocumentNumber: `9${id}`.slice(0, 15),
    userPassword: STRONG_PASSWORD,
    groupNames: ["Mesero"],
    isActive: true,
    ...overrides,
  };
}

// Administrador de pruebas: se crea DIRECTO en la BD con database/seed-admin.js
// (una vez por proceso) y se reutiliza su token en las demás peticiones.
let adminPromise;
export function adminToken() {
  adminPromise ??= (async () => {
    const id = uid();
    const email = `test_admin_${id}@cafeterito.test`;
    const { seedAdmin } = await import("../database/seed-admin.js");
    const { id: userId } = await seedAdmin({
      email,
      password: STRONG_PASSWORD,
      name: `${PREFIX}Admin ${id}`,
      database: TEST_DB,
      log: () => {},
    });
    const res = await login(email, STRONG_PASSWORD);
    if (!res.body?.token) throw new Error(`Login del admin de pruebas falló: ${res.status} ${res.text}`);
    return { id: userId, email, password: STRONG_PASSWORD, token: res.body.token };
  })();
  return adminPromise;
}

// Crea un usuario por la API (con el token del admin) y devuelve { id, email, password }
export async function createUser(overrides = {}) {
  const payload = userPayload(overrides);
  const { token } = await adminToken();
  const res = await api("POST", "/api/users", { body: payload, token });
  if (res.status !== 201) {
    throw new Error(`No se pudo crear el usuario de prueba: ${res.status} ${res.text}`);
  }
  return { id: res.body.userId, email: payload.userEmail, password: payload.userPassword, payload };
}

// Desactiva un usuario como lo haría un administrador (el alta ya no acepta isActive del cliente)
export async function deactivateUser(user) {
  const { token } = await adminToken();
  const res = await api("PATCH", `/api/users/${user.id}/status`, {
    token,
    body: { isActive: false },
  });
  if (res.status !== 200) throw new Error(`No se pudo desactivar: ${res.status} ${res.text}`);
}

export async function login(email, password) {
  return api("POST", "/api/auth/login", { body: { email, password } });
}

// Borra TODO lo creado por la suite (orden importa por las FK).
export async function cleanup() {
  await pool.query(
    `DELETE FROM orders
     WHERE table_number >= $1
        OR observations LIKE 'TEST\\_%'
        OR id IN (SELECT oi.order_id FROM order_items oi
                  JOIN products p ON p.id = oi.product_id
                  WHERE p.product_name LIKE 'TEST\\_%')`,
    [TEST_TABLE_MIN]
  );
  await pool.query(`DELETE FROM products  WHERE product_name   LIKE 'TEST\\_%'`);
  await pool.query(`DELETE FROM inventory WHERE provision_name LIKE 'TEST\\_%'`);
  await pool.query(`DELETE FROM providers WHERE provider_name  LIKE 'TEST\\_%'`);
  await pool.query(`DELETE FROM users     WHERE user_email     LIKE 'test\\_%'`);
}

// Decodifica el payload de un JWT sin verificar la firma
export function decodeJwt(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
}
