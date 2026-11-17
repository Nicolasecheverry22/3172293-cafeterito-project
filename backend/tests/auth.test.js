// AUTH — RFADMIN01, RFADMIN05, RNF08–RNF11
// Cada prueba describe el comportamiento REQUERIDO: si falla, es un hallazgo.

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  startServer, stopServer, cleanup, api, createUser, login, pool, decodeJwt, deactivateUser, adminToken,
} from "./helpers.js";
import { hashResetCode } from "../src/features/auth/auth.service.js";

before(startServer);
after(async () => {
  await cleanup();
  await stopServer();
});

describe("AUTH", () => {
  let user;
  before(async () => {
    user = await createUser();
  });

  test("[RFADMIN01] login correcto devuelve token", async () => {
    const res = await login(user.email, user.password);
    assert.equal(res.status, 200);
    assert.ok(res.body.token, "debe devolver token");
  });

  test("[RFADMIN01] login no devuelve el hash de la contraseña", async () => {
    const res = await login(user.email, user.password);
    assert.doesNotMatch(res.text, /\$2[aby]\$/);
  });

  test("[RFADMIN01] contraseña incorrecta -> 401", async () => {
    const res = await login(user.email, "Incorrecta#123");
    assert.equal(res.status, 401);
  });

  test("[RFADMIN01] correo inexistente -> 401", async () => {
    const res = await login("test_noexiste@cafeterito.test", "Cualquiera#123");
    assert.equal(res.status, 401);
  });

  test("[RFADMIN01] body sin password -> 400 (validación), no error interno de bcrypt", async () => {
    const res = await api("POST", "/api/auth/login", { body: { email: user.email } });
    assert.equal(res.status, 400);
  });

  test("[RNF08] contraseñas guardadas con bcrypt (no texto plano)", async () => {
    const { rows } = await pool.query("SELECT user_password FROM users WHERE id = $1", [user.id]);
    assert.match(rows[0].user_password, /^\$2[aby]\$\d{2}\$/);
    assert.notEqual(rows[0].user_password, user.password);
  });

  test("[RNF11] bloqueo tras 3 intentos fallidos consecutivos", async () => {
    const victim = await createUser();
    for (let i = 0; i < 3; i++) await login(victim.email, "Mala#Clave123");
    const res = await login(victim.email, victim.password);
    assert.notEqual(res.status, 200, "con la contraseña correcta NO debería entrar tras 3 fallos");
  });

  test("[RNF09] el JWT expira en <= 10 minutos (inactividad)", async () => {
    const res = await login(user.email, user.password);
    const { iat, exp } = decodeJwt(res.body.token);
    assert.ok(exp, "el token debe tener exp");
    assert.ok(exp - iat <= 600, `el token dura ${exp - iat}s; se esperaba <= 600s`);
  });

  test("[RFADMIN05] usuario inactivo no puede iniciar sesión", async () => {
    const inactive = await createUser();
    await deactivateUser(inactive);
    const res = await login(inactive.email, inactive.password);
    assert.ok([401, 403].includes(res.status), `status ${res.status}`);
  });

  test("[RFADMIN01] olvidé mi contraseña: existe el endpoint", async () => {
    const res = await api("POST", "/api/auth/forgot-password", { body: { email: user.email } });
    assert.notEqual(res.status, 404, "no existe /api/auth/forgot-password");
  });

  test("[RFADMIN01] restablecer contraseña: existe el endpoint", async () => {
    const res = await api("POST", "/api/auth/reset-password", {
      body: { token: "x", password: "Nueva#Clave2026" },
    });
    assert.notEqual(res.status, 404, "no existe /api/auth/reset-password");
  });

  test("[RNF09] existe endpoint de logout / invalidación de sesión", async () => {
    const res = await api("POST", "/api/auth/logout");
    assert.notEqual(res.status, 404);
  });
});

describe("AUTH — protección de rutas privadas", () => {
  const privateRoutes = [
    ["GET", "/api/users"],
    ["GET", "/api/products"],
    ["GET", "/api/inventory"],
    ["GET", "/api/providers"],
    ["GET", "/api/orders"],
    ["GET", "/api/users/report-data"],
  ];

  for (const [method, path] of privateRoutes) {
    test(`[RNF] ${method} ${path} sin token -> 401`, async () => {
      const res = await api(method, path);
      assert.equal(res.status, 401);
    });
  }

  test("[RNF] token inválido -> 401", async () => {
    const res = await api("GET", "/api/orders", { token: "token.invalido.xyz" });
    assert.equal(res.status, 401);
  });

  test("[RNF] /api/access/check (único protegido) rechaza sin token", async () => {
    const res = await api("GET", "/api/access/check/list_user");
    assert.equal(res.status, 401);
  });
});

// ───────────────────── FASE 7: bloqueo, sesión y recuperación ─────────────────────
describe("AUTH — bloqueo y sesión (RNF09, RNF11)", () => {
  test("[RNF11] el 3er intento fallido responde 423 'Cuenta bloqueada temporalmente'", async () => {
    const u = await createUser();
    const r1 = await login(u.email, "Mala#Clave123");
    const r2 = await login(u.email, "Mala#Clave123");
    const r3 = await login(u.email, "Mala#Clave123");
    assert.deepEqual([r1.status, r2.status], [401, 401]);
    assert.equal(r3.status, 423);
    assert.match(r3.body.error, /bloqueada/i);
    const { rows } = await pool.query("SELECT locked_until > now() AS locked FROM users WHERE id=$1", [u.id]);
    assert.equal(rows[0].locked, true);
  });

  test("[RNF11] un login correcto reinicia el contador de intentos", async () => {
    const u = await createUser();
    await login(u.email, "Mala#Clave123");
    await login(u.email, "Mala#Clave123");
    assert.equal((await login(u.email, u.password)).status, 200);
    await login(u.email, "Mala#Clave123");
    await login(u.email, "Mala#Clave123");
    assert.equal((await login(u.email, u.password)).status, 200, "no debería bloquear: el contador se reinició");
  });

  test("[RNF11] el admin desbloquea al usuario reactivándolo (PATCH status)", async () => {
    const u = await createUser();
    for (let i = 0; i < 3; i++) await login(u.email, "Mala#Clave123");
    assert.equal((await login(u.email, u.password)).status, 423);
    const { token } = await adminToken();
    await api("PATCH", `/api/users/${u.id}/status`, { token, body: { isActive: true } });
    assert.equal((await login(u.email, u.password)).status, 200);
  });

  test("[RNF09] POST /api/auth/refresh devuelve un token nuevo de <= 10 min", async () => {
    const u = await createUser();
    const { body } = await login(u.email, u.password);
    const res = await api("POST", "/api/auth/refresh", { token: body.token });
    assert.equal(res.status, 200);
    const { iat, exp } = decodeJwt(res.body.token);
    assert.ok(exp - iat <= 600);
  });

  test("[RNF09] refresh sin token -> 401", async () => {
    assert.equal((await api("POST", "/api/auth/refresh")).status, 401);
  });

  test("[RFADMIN05] el token de un usuario deshabilitado deja de servir de inmediato -> 401", async () => {
    const u = await createUser();
    const { body } = await login(u.email, u.password);
    assert.equal((await api("GET", "/api/products", { token: body.token })).status, 200);
    await deactivateUser(u);
    assert.equal((await api("GET", "/api/products", { token: body.token })).status, 401);
    assert.equal((await api("POST", "/api/auth/refresh", { token: body.token })).status, 401);
  });

  test("[RNF] esquema distinto de Bearer -> 401", async () => {
    const u = await createUser();
    const { body } = await login(u.email, u.password);
    const res = await fetch(`${await startServer()}/api/products`, {
      headers: { Authorization: `Token ${body.token}` },
    });
    assert.equal(res.status, 401);
  });
});

describe("AUTH — recuperación de contraseña (RFADMIN01)", () => {
  const NEW_PASSWORD = "Nueva#Clave2026";

  // El código real solo viaja por correo: la prueba lo reemplaza por uno conocido.
  async function requestCode(user, code = "123456") {
    const res = await api("POST", "/api/auth/forgot-password", { body: { email: user.email } });
    assert.equal(res.status, 200);
    const { rowCount } = await pool.query(
      "UPDATE password_reset_tokens SET token_hash = $2 WHERE user_id = $1 AND used_at IS NULL",
      [user.id, hashResetCode(user.id, code)]
    );
    assert.equal(rowCount, 1, "debe existir exactamente un código vigente");
    return code;
  }

  test("forgot-password responde igual exista o no el correo (no revela usuarios)", async () => {
    const u = await createUser();
    const a = await api("POST", "/api/auth/forgot-password", { body: { email: u.email } });
    const b = await api("POST", "/api/auth/forgot-password", { body: { email: "test_noexiste@cafeterito.test" } });
    assert.equal(a.status, 200);
    assert.equal(b.status, 200);
    assert.deepEqual(a.body, b.body);
  });

  test("el código se guarda hasheado y vence en ~15 minutos", async () => {
    const u = await createUser();
    await api("POST", "/api/auth/forgot-password", { body: { email: u.email } });
    const { rows } = await pool.query(
      `SELECT token_hash, EXTRACT(EPOCH FROM (expires_at - created_at)) AS ttl
       FROM password_reset_tokens WHERE user_id = $1`,
      [u.id]
    );
    assert.equal(rows.length, 1);
    assert.doesNotMatch(rows[0].token_hash, /^\d{6}$/, "el código no debe guardarse en texto plano");
    assert.ok(Math.abs(Number(rows[0].ttl) - 900) < 5);
  });

  test("verify-reset-token: código correcto -> 200; incorrecto -> 400", async () => {
    const u = await createUser();
    const code = await requestCode(u);
    const ok = await api("POST", "/api/auth/verify-reset-token", { body: { email: u.email, token: code } });
    assert.equal(ok.status, 200);
    const bad = await api("POST", "/api/auth/verify-reset-token", { body: { email: u.email, token: "000000" } });
    assert.equal(bad.status, 400);
  });

  test("reset-password cambia la contraseña y el código es de un solo uso", async () => {
    const u = await createUser();
    const code = await requestCode(u);
    const res = await api("POST", "/api/auth/reset-password", {
      body: { email: u.email, token: code, password: NEW_PASSWORD },
    });
    assert.equal(res.status, 200, res.text);
    assert.equal((await login(u.email, NEW_PASSWORD)).status, 200);
    assert.equal((await login(u.email, u.password)).status, 401);
    const again = await api("POST", "/api/auth/reset-password", {
      body: { email: u.email, token: code, password: "Otra#Clave20266" },
    });
    assert.equal(again.status, 400, "el código ya fue usado");
  });

  test("reset-password aplica la política RNF10 -> 400", async () => {
    const u = await createUser();
    const code = await requestCode(u);
    const res = await api("POST", "/api/auth/reset-password", {
      body: { email: u.email, token: code, password: "debil" },
    });
    assert.equal(res.status, 400);
  });

  test("código vencido -> 400", async () => {
    const u = await createUser();
    const code = await requestCode(u);
    await pool.query(
      "UPDATE password_reset_tokens SET expires_at = now() - interval '1 minute' WHERE user_id = $1",
      [u.id]
    );
    const res = await api("POST", "/api/auth/verify-reset-token", { body: { email: u.email, token: code } });
    assert.equal(res.status, 400);
  });

  test("tras 5 intentos fallidos el código queda inutilizable", async () => {
    const u = await createUser();
    const code = await requestCode(u);
    for (let i = 0; i < 5; i++) {
      await api("POST", "/api/auth/verify-reset-token", { body: { email: u.email, token: "999999" } });
    }
    const res = await api("POST", "/api/auth/verify-reset-token", { body: { email: u.email, token: code } });
    assert.equal(res.status, 400);
  });

  test("solicitar un código nuevo invalida el anterior", async () => {
    const u = await createUser();
    const first = await requestCode(u, "111111");
    await requestCode(u, "222222");
    const res = await api("POST", "/api/auth/verify-reset-token", { body: { email: u.email, token: first } });
    assert.equal(res.status, 400);
  });
});
