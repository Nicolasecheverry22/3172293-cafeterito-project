// ÓRDENES (RFADMIN26–31) y TRANSVERSALES (RNF02, manejo de errores, 404)

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  startServer, stopServer, cleanup, api, pool, adminToken, TEST_TABLE_MIN, PREFIX,
} from "./helpers.js";

let token;
let availableId;
let availablePrice;
let unavailableId;
let table = TEST_TABLE_MIN;
const nextTable = () => ++table;

before(async () => {
  await startServer();
  token = (await adminToken()).token;
  // Platillos de prueba propios (no dependemos del seed)
  const a = await pool.query(
    `INSERT INTO products (product_name, category, price, is_available)
     VALUES ($1, 'Pruebas', 12000, true) RETURNING id, price::float`,
    [`${PREFIX}Disponible`]
  );
  const u = await pool.query(
    `INSERT INTO products (product_name, category, price, is_available)
     VALUES ($1, 'Pruebas', 9000, false) RETURNING id`,
    [`${PREFIX}NoDisponible`]
  );
  availableId = a.rows[0].id;
  availablePrice = a.rows[0].price;
  unavailableId = u.rows[0].id;
});
after(async () => {
  await cleanup();
  await stopServer();
});

const createOrder = (body) => api("POST", "/api/orders", { token, body });
const order = (o = {}) => ({
  tableNumber: nextTable(),
  observations: `${PREFIX}orden`,
  items: [{ productId: availableId, quantity: 2 }],
  ...o,
});

async function setStatus(id, status) {
  const current = (await api("GET", `/api/orders/${id}`, { token })).body;
  return api("PUT", `/api/orders/${id}`, {
    token,
    body: {
      tableNumber: current.tableNumber,
      status,
      observations: current.observations,
      items: current.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    },
  });
}

describe("ÓRDENES", () => {
  test("[RFADMIN26] crear orden -> 201", async () => {
    const res = await createOrder(order());
    assert.equal(res.status, 201);
  });

  test("[RFADMIN26] total calculado en servidor (ignora precio del cliente)", async () => {
    const res = await createOrder(order({ items: [{ productId: availableId, quantity: 3, price: 1, unitPrice: 1 }] }));
    const detail = await api("GET", `/api/orders/${res.body.orderId}`, { token });
    assert.equal(detail.body.total, availablePrice * 3);
  });

  test("[RFADMIN26] una mesa solo puede tener una orden activa -> 409", async () => {
    const t = nextTable();
    await createOrder(order({ tableNumber: t }));
    const res = await createOrder(order({ tableNumber: t }));
    assert.equal(res.status, 409);
  });

  test("[RFADMIN26] orden sin platillos -> 400", async () => {
    const res = await createOrder(order({ items: [] }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN26] cantidad 0 -> 400", async () => {
    const res = await createOrder(order({ items: [{ productId: availableId, quantity: 0 }] }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN26] cantidad negativa -> 400", async () => {
    const res = await createOrder(order({ items: [{ productId: availableId, quantity: -1 }] }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN26/RFADMIN11] platillo inhabilitado no se puede agregar -> 400", async () => {
    const res = await createOrder(order({ items: [{ productId: unavailableId, quantity: 1 }] }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN26] producto inexistente -> 400", async () => {
    const res = await createOrder(order({ items: [{ productId: 99999999, quantity: 1 }] }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN26] mesero inexistente -> 400", async () => {
    const res = await createOrder(order({ waiterId: 99999999 }));
    assert.equal(res.status, 400);
  });

  test("[RFADMIN26] la orden registra el usuario autenticado que la creó", async () => {
    const res = await createOrder(order());
    const detail = await api("GET", `/api/orders/${res.body.orderId}`, { token });
    assert.ok(detail.body.waiterId, "la orden no queda asociada al usuario del token");
  });

  test("[RFADMIN28] orden pagada NO se puede actualizar -> 409", async () => {
    const created = await createOrder(order());
    await setStatus(created.body.orderId, "pagada");
    const res = await setStatus(created.body.orderId, "activa");
    assert.equal(res.status, 409);
  });

  test("[RFADMIN28] orden cancelada NO se puede reactivar -> 409", async () => {
    const created = await createOrder(order());
    await setStatus(created.body.orderId, "cancelada");
    const res = await setStatus(created.body.orderId, "activa");
    assert.equal(res.status, 409);
  });

  test("[RFADMIN29] orden pagada NO se puede anular (pagada -> cancelada) -> 409", async () => {
    const created = await createOrder(order());
    await setStatus(created.body.orderId, "pagada");
    const res = await setStatus(created.body.orderId, "cancelada");
    assert.equal(res.status, 409);
  });

  test("[RFADMIN29] orden pagada NO se puede eliminar -> 409", async () => {
    const created = await createOrder(order());
    await setStatus(created.body.orderId, "pagada");
    const res = await api("DELETE", `/api/orders/${created.body.orderId}`, { token });
    assert.equal(res.status, 409);
  });

  test("[RFADMIN29] orden cancelada NO se puede eliminar (historial) -> 409", async () => {
    const created = await createOrder(order());
    await setStatus(created.body.orderId, "cancelada");
    const res = await api("DELETE", `/api/orders/${created.body.orderId}`, { token });
    assert.equal(res.status, 409);
  });

  test("[RFADMIN30] estado 'lista para entrega' es aceptado", async () => {
    const created = await createOrder(order());
    const res = await setStatus(created.body.orderId, "lista para entrega");
    assert.equal(res.status, 200, res.text);
  });

  test("[RFADMIN30] estado inválido -> 400", async () => {
    const created = await createOrder(order());
    const res = await setStatus(created.body.orderId, "inventado");
    assert.equal(res.status, 400);
  });

  test("[RFADMIN31] filtro por mesa en servidor (?tableNumber=)", async () => {
    const t = nextTable();
    await createOrder(order({ tableNumber: t }));
    const res = await api("GET", `/api/orders?tableNumber=${t}`, { token });
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    assert.ok(list.every((o) => o.tableNumber === t), "?tableNumber no filtra en GET /api/orders");
  });
});

describe("TRANSVERSALES", () => {
  test("[RNF02] existe tabla de auditoría/bitácora", async () => {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema='public' AND (table_name ILIKE '%audit%' OR table_name ILIKE '%log%' OR table_name ILIKE '%bitacora%')`
    );
    assert.ok(rowCount > 0, "no hay tabla de auditoría");
  });

  test("[RNF02] tablas de negocio registran quién modificó (updated_by)", async () => {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND column_name IN ('updated_by','modified_by','created_by')`
    );
    assert.ok(rowCount > 0, "ninguna tabla registra el usuario que modifica");
  });

  test("[RNF] ruta inexistente -> 404 en JSON", async () => {
    const res = await api("GET", "/api/no-existe");
    assert.equal(res.status, 404);
    assert.ok(res.body, `respuesta no es JSON: ${res.text.slice(0, 60)}`);
  });

  test("[RNF] JSON malformado -> 400 en JSON sin stack trace", async () => {
    const res = await api("POST", "/api/auth/login", { raw: "{malformado" });
    assert.equal(res.status, 400);
    assert.doesNotMatch(res.text, /node_modules|at JSON\.parse|<pre>/);
  });

  test("[RNF] errores internos no filtran mensajes de PostgreSQL", async () => {
    const res = await api("GET", "/api/orders/abc", { token });
    assert.doesNotMatch(res.text, /sintaxis|syntax|integer|NaN|llave|violates/i);
  });
});
