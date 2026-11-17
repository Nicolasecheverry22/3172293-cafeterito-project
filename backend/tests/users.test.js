// USUARIOS — RFADMIN02–RFADMIN07, RNF10

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  startServer, stopServer, cleanup, api, createUser, userPayload, pool, adminToken, PREFIX,
} from "./helpers.js";

let admin;
before(async () => {
  await startServer();
  admin = await adminToken();
});
after(async () => {
  await cleanup();
  await stopServer();
});

const post = (body) => api("POST", "/api/users", { body, token: admin.token });

describe("USUARIOS — camino feliz", () => {
  test("[RFADMIN02] crear usuario -> 201", async () => {
    const res = await post(userPayload());
    assert.equal(res.status, 201);
    assert.ok(res.body.userId);
  });

  test("[RFADMIN03] ver usuario por id -> 200 sin hash de contraseña", async () => {
    const u = await createUser();
    const res = await api("GET", `/api/users/${u.id}`, { token: admin.token });
    assert.equal(res.status, 200);
    assert.equal(res.body.userEmail, u.email);
    assert.doesNotMatch(res.text, /password|\$2[aby]\$/i);
  });

  test("[RFADMIN03] listado no expone hashes", async () => {
    const res = await api("GET", "/api/users", { token: admin.token });
    assert.equal(res.status, 200);
    assert.doesNotMatch(res.text, /\$2[aby]\$/);
  });

  test("[RFADMIN04] actualizar usuario -> 200", async () => {
    const u = await createUser();
    const res = await api("PUT", `/api/users/${u.id}`, {
      token: admin.token,
      body: { ...u.payload, userName: "Test Editado", groupNames: ["Mesero"] },
    });
    assert.equal(res.status, 200);
  });

  test("[RFADMIN05] deshabilitar usuario (cambio de estado) -> is_active=false", async () => {
    const u = await createUser();
    const res = await api("PUT", `/api/users/${u.id}`, {
      token: admin.token,
      body: { ...u.payload, isActive: false },
    });
    assert.equal(res.status, 200);
    const { rows } = await pool.query("SELECT is_active FROM users WHERE id=$1", [u.id]);
    assert.equal(rows[0].is_active, false);
  });

  test("[RFADMIN04] usuario inexistente -> 404", async () => {
    const res = await api("GET", "/api/users/99999999", { token: admin.token });
    assert.equal(res.status, 404);
  });
});

describe("USUARIOS — validaciones", () => {
  test("[RFADMIN02] correo repetido -> 409", async () => {
    const u = await createUser();
    const res = await post(userPayload({ userEmail: u.email }));
    assert.equal(res.status, 409);
  });

  test("[RFADMIN02] correo con formato inválido -> 400", async () => {
    const res = await post(userPayload({ userEmail: "test_no-es-un-correo" }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] correo se normaliza (mayúsculas no duplican usuario)", async () => {
    const u = await createUser();
    const res = await post(userPayload({ userEmail: u.email.toUpperCase().replace("TEST_", "test_") }));
    assert.equal(res.status, 409);
  });

  test("[RNF10] contraseña débil ('123') -> 400", async () => {
    const res = await post(userPayload({ userPassword: "123" }));
    assert.equal(res.status, 400);
  });

  test("[RNF10] contraseña sin símbolo ni mayúscula -> 400", async () => {
    const res = await post(userPayload({ userPassword: "cafeterito2026" }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] documento no numérico -> 400", async () => {
    const res = await post(userPayload({ userDocumentNumber: "ABC123" }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] documento de más de 15 dígitos -> 400", async () => {
    const res = await post(userPayload({ userDocumentNumber: "1234567890123456" }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] teléfono de menos de 7 dígitos -> 400", async () => {
    const res = await post(userPayload({ userPhone: "12345" }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] teléfono con letras -> 400", async () => {
    const res = await post(userPayload({ userPhone: "300-ABC-1234" }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] nombre vacío -> 400 (no 500)", async () => {
    const res = await post(userPayload({ userName: "" }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] sin correo -> 400 (no 500 por NOT NULL)", async () => {
    const p = userPayload();
    delete p.userEmail;
    const res = await post(p);
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] la API ignora isSuperuser enviado por el cliente (escalada de privilegios)", async () => {
    const res = await post(userPayload({ groupNames: ["Mesero"], isSuperuser: true, isStaff: true }));
    assert.equal(res.status, 201);
    const { rows } = await pool.query("SELECT is_superuser FROM users WHERE id=$1", [res.body.userId]);
    assert.equal(rows[0].is_superuser, false, "un Mesero quedó como superusuario");
  });

  test("[SEG] sin token se puede crear un superusuario y obtener acceso total (cadena completa)", async () => {
    const p = userPayload({ groupNames: ["Invitado"], isSuperuser: true });
    const created = await api("POST", "/api/users", { body: p }); // SIN token
    const session = await api("POST", "/api/auth/login", {
      body: { email: p.userEmail, password: p.userPassword },
    });
    const check = await api("GET", "/api/access/check/delete_order", { token: session.body?.token });
    const escalated = created.status === 201 && check.body?.granted === true;
    assert.equal(escalated, false, "un anónimo creó un superusuario con acceso a todos los permisos");
  });

  test("[RFADMIN02] usuario creado sin enviar isActive queda activo y puede iniciar sesión", async () => {
    const p = userPayload();
    delete p.isActive;
    const created = await post(p);
    assert.equal(created.status, 201);
    const res = await api("POST", "/api/auth/login", {
      body: { email: p.userEmail, password: p.userPassword },
    });
    assert.equal(res.status, 200, `login: ${res.text}`);
  });

  test("[RFADMIN02] rol Administrador marca is_superuser coherente al crear (igual que al editar)", async () => {
    const res = await post(userPayload({ groupNames: ["Administrador"] }));
    const { rows } = await pool.query("SELECT is_superuser FROM users WHERE id=$1", [res.body.userId]);
    assert.equal(rows[0].is_superuser, true);
  });

  test("[RFADMIN02] grupo inexistente -> 400 (no crear usuario sin rol)", async () => {
    const res = await post(userPayload({ groupNames: ["RolQueNoExiste"] }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN02] dirección fuera de 10–100 caracteres -> 400; válida se guarda", async () => {
    const bad = await post(userPayload({ userAddress: "Corta" }));
    assert.equal(bad.status, 400);
    const ok = await post(userPayload({ userAddress: "Calle 10 # 20-30, Cali" }));
    assert.equal(ok.status, 201);
    const res = await api("GET", `/api/users/${ok.body.userId}`, { token: admin.token });
    assert.equal(res.body.userAddress, "Calle 10 # 20-30, Cali");
  });

  test("[RFADMIN02] correo personal igual al empresarial -> 400", async () => {
    const p = userPayload();
    const res = await post({ ...p, userPersonalEmail: p.userEmail.toUpperCase() });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN04] id no numérico -> 400 (no 500)", async () => {
    const res = await api("GET", "/api/users/abc", { token: admin.token });
    assert.equal(res.status, 400);
  });
});

describe("USUARIOS — reglas de negocio", () => {
  test("[RFADMIN05] PATCH /:id/status deshabilita y habilita (fila conservada)", async () => {
    const u = await createUser();
    const off = await api("PATCH", `/api/users/${u.id}/status`, { token: admin.token, body: { isActive: false } });
    assert.equal(off.status, 200);
    assert.equal(off.body.isActive, false);
    const on = await api("PATCH", `/api/users/${u.id}/status`, { token: admin.token, body: { isActive: true } });
    assert.equal(on.body.isActive, true);
  });

  test("[RFADMIN05] un usuario no puede desactivarse a sí mismo -> 400", async () => {
    const res = await api("PATCH", `/api/users/${admin.id}/status`, { token: admin.token, body: { isActive: false } });
    assert.equal(res.status, 400);
  });


  test("[RFADMIN05] no existe borrado físico (DELETE no elimina la fila)", async () => {
    const u = await createUser();
    await api("DELETE", `/api/users/${u.id}`, { token: admin.token });
    const { rowCount } = await pool.query("SELECT 1 FROM users WHERE id=$1", [u.id]);
    assert.equal(rowCount, 1, "el usuario fue borrado físicamente");
  });

  test("[RFADMIN03] listado ordenado alfabéticamente por nombre", async () => {
    await createUser({ userName: "Test zzz" });
    await createUser({ userName: "Test aaa" });
    const res = await api("GET", "/api/users", { token: admin.token });
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    const names = list.map((u) => u.userName);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
    assert.deepEqual(names, sorted);
  });

  test("[RFADMIN03] listado paginado (máx. 20 por página)", async () => {
    for (let i = 0; i < 21; i++) await createUser();
    const res = await api("GET", "/api/users?page=1&limit=20", { token: admin.token });
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    assert.ok(list.length <= 20, `devolvió ${list.length} registros en una página`);
  });
});
