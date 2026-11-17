// Rate limiting de /api/auth y helmet (H09). Archivo propio (= proceso propio):
// fija límites bajos ANTES de importar la app, porque el limitador se configura al cargarse.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

process.env.RATE_LIMIT_RESET_MAX = "3";
process.env.RATE_LIMIT_LOGIN_MAX = "5";
const { startServer, stopServer, cleanup, api } = await import("./helpers.js");

before(startServer);
after(async () => {
  await cleanup();
  await stopServer();
});

test("[H09] forgot-password: superado el límite responde 429", async () => {
  const statuses = [];
  for (let i = 0; i < 4; i++) {
    const res = await api("POST", "/api/auth/forgot-password", {
      body: { email: "test_rl@cafeterito.test" },
    });
    statuses.push(res.status);
  }
  assert.deepEqual(statuses, [200, 200, 200, 429]);
});

test("[H09] login: superado el límite responde 429", async () => {
  let last;
  for (let i = 0; i < 6; i++) {
    last = await api("POST", "/api/auth/login", {
      body: { email: "test_rl@cafeterito.test", password: "x" },
    });
  }
  assert.equal(last.status, 429);
});

test("[H09] helmet agrega cabeceras de seguridad y no expone X-Powered-By", async () => {
  const res = await api("GET", "/api/no-existe");
  assert.ok(res.headers.get("x-content-type-options"));
  assert.equal(res.headers.get("x-powered-by"), null);
});
