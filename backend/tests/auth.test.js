// AUTH — RFADMIN01, RFADMIN05, RNF08–RNF11
// Cada prueba describe el comportamiento REQUERIDO: si falla, es un hallazgo.

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  startServer, stopServer, cleanup, api, createUser, login, pool, decodeJwt,
} from "./helpers.js";

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
    const inactive = await createUser({ isActive: false });
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
