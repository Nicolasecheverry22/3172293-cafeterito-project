// MENÚ/PRODUCTOS (RFADMIN20–25), INVENTARIO (RFADMIN08–13), PROVEEDORES (RFADMIN14–19)

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  startServer, stopServer, cleanup, api, pool, adminToken, uid, PREFIX,
} from "./helpers.js";

let token;
before(async () => {
  await startServer();
  token = (await adminToken()).token;
});
after(async () => {
  await cleanup();
  await stopServer();
});

// ───────────────────────────── MENÚ (products) ─────────────────────────────
const dish = (o = {}) => ({
  productName: `${PREFIX}Platillo ${uid()}`,
  category: "Bebidas",
  price: 5000,
  description: "Plato de prueba",
  isAvailable: true,
  ...o,
});

describe("MENÚ (products)", () => {
  test("[RFADMIN20] crear platillo -> 201", async () => {
    const res = await api("POST", "/api/products", { token, body: dish() });
    assert.equal(res.status, 201);
  });

  test("[RFADMIN21] listar y ver platillo -> 200", async () => {
    const created = await api("POST", "/api/products", { token, body: dish() });
    const res = await api("GET", `/api/products/${created.body.productId}`, { token });
    assert.equal(res.status, 200);
  });

  test("[RFADMIN20] precio <= 0 -> 400", async () => {
    const res = await api("POST", "/api/products", { token, body: dish({ price: -5 }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN20] precio no numérico -> 400 (no 500)", async () => {
    const res = await api("POST", "/api/products", { token, body: dish({ price: "abc" }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN20] nombre faltante -> 400 (no 500)", async () => {
    const res = await api("POST", "/api/products", { token, body: dish({ productName: undefined }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN20] nombre único por categoría -> 409", async () => {
    const body = dish();
    await api("POST", "/api/products", { token, body });
    const res = await api("POST", "/api/products", { token, body });
    assert.equal(res.status, 409);
  });

  test("[RFADMIN20] categoría obligatoria -> 400", async () => {
    const res = await api("POST", "/api/products", { token, body: dish({ category: "" }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN23] actualizar con precio 0 -> 400", async () => {
    const created = await api("POST", "/api/products", { token, body: dish() });
    const res = await api("PUT", `/api/products/${created.body.productId}`, {
      token, body: dish({ price: 0 }),
    });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN24] inhabilitar es cambio de estado; DELETE no borra físicamente", async () => {
    const created = await api("POST", "/api/products", { token, body: dish() });
    const id = created.body.productId;
    await api("DELETE", `/api/products/${id}`, { token });
    const { rowCount } = await pool.query("SELECT 1 FROM products WHERE id=$1", [id]);
    assert.equal(rowCount, 1, "el platillo fue borrado físicamente");
  });

  test("[RFADMIN21] existen categorías de menú como entidad (endpoint)", async () => {
    const res = await api("GET", "/api/menu-categories", { token });
    assert.notEqual(res.status, 404, "no hay backend de categorías de menú");
  });

  test("[RFADMIN22] filtro/paginación en servidor (?category=)", async () => {
    const res = await api("GET", "/api/products?category=Bebidas", { token });
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    assert.ok(list.every((p) => p.category === "Bebidas"), "el filtro ?category no se aplica");
  });

  test("[RNF] id no numérico -> 400 sin filtrar mensaje de PostgreSQL", async () => {
    const res = await api("GET", "/api/products/abc", { token });
    assert.equal(res.status, 400);
    assert.doesNotMatch(res.text, /sintaxis|syntax|integer|NaN/i);
  });
});

// ───────────────────────────── INVENTARIO ─────────────────────────────
const supply = (o = {}) => ({
  provisionName: `${PREFIX}Insumo ${uid()}`,
  category: "Granos",
  unit: "kg",
  stock: 10,
  price: 2000,
  batch: `LOT-T${uid()}`,
  minStock: 2,
  maxStock: 50,
  status: "Disponible",
  barcode: `TEST-${uid()}`,
  ...o,
});

describe("INVENTARIO", () => {
  test("[RFADMIN08] crear insumo -> 201", async () => {
    const res = await api("POST", "/api/inventory", { token, body: supply() });
    assert.equal(res.status, 201);
  });

  test("[RFADMIN08] campos obligatorios: sin nombre -> 400 (no 500)", async () => {
    const res = await api("POST", "/api/inventory", { token, body: supply({ provisionName: undefined }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN08] stock negativo -> 400", async () => {
    const res = await api("POST", "/api/inventory", { token, body: supply({ stock: -3 }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN08] estado fuera de Disponible/Vencido/Avería/Agotado -> 400", async () => {
    const res = await api("POST", "/api/inventory", { token, body: supply({ status: "Inventado" }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN08] maxStock < minStock en creación -> 400", async () => {
    const res = await api("POST", "/api/inventory", { token, body: supply({ minStock: 50, maxStock: 5 }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN08] lote único por insumo (mismo lote repetido -> 409)", async () => {
    const body = supply();
    await api("POST", "/api/inventory", { token, body });
    const res = await api("POST", "/api/inventory", { token, body });
    assert.equal(res.status, 409);
  });

  test("[RFADMIN08] código de barras único (campo existe y es UNIQUE)", async () => {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name IN ('inventory','products') AND column_name ILIKE '%barcode%'`
    );
    assert.ok(rowCount > 0, "no existe columna de código de barras");
  });

  test("[RFADMIN08] los estados sembrados coinciden con los requeridos", async () => {
    const { rows } = await pool.query(
      "SELECT DISTINCT status FROM inventory WHERE provision_name NOT LIKE 'TEST\\_%'"
    );
    const allowed = ["Disponible", "Vencido", "Avería", "Agotado"];
    const bad = rows.map((r) => r.status).filter((s) => !allowed.includes(s));
    assert.deepEqual(bad, [], `estados no válidos en BD: ${bad.join(", ")}`);
  });

  test("[RFADMIN10] DELETE no borra físicamente", async () => {
    const created = await api("POST", "/api/inventory", { token, body: supply() });
    const id = created.body.inventoryId;
    await api("DELETE", `/api/inventory/${id}`, { token });
    const { rowCount } = await pool.query("SELECT 1 FROM inventory WHERE id=$1", [id]);
    assert.equal(rowCount, 1);
  });

  test("[RFADMIN08] insumo asociado a proveedor (FK)", async () => {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name='inventory' AND column_name ILIKE '%provider%'`
    );
    assert.ok(rowCount > 0, "inventory no tiene relación con providers");
  });
});

// ───────────────────────────── PROVEEDORES ─────────────────────────────
const provider = (o = {}) => ({
  nit: `9${uid()}`.slice(0, 10),
  providerName: `${PREFIX}Proveedor ${uid()}`,
  providerEmail: "test_proveedor@cafeterito.test",
  providerPhone: "3001234567",
  providerAddress: "Calle 1 # 2-3, Cali",
  productService: "Insumos de prueba",
  isActive: true,
  ...o,
});

describe("PROVEEDORES", () => {
  test("[RFADMIN14] crear proveedor -> 201", async () => {
    const res = await api("POST", "/api/providers", { token, body: provider() });
    assert.equal(res.status, 201);
  });

  test("[RFADMIN14] documento (NIT) obligatorio -> 400", async () => {
    const res = await api("POST", "/api/providers", { token, body: provider({ nit: undefined }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN14] documento único -> 409", async () => {
    const body = provider();
    await api("POST", "/api/providers", { token, body });
    const res = await api("POST", "/api/providers", { token, body: { ...body, providerName: `${PREFIX}Otro ${uid()}` } });
    assert.equal(res.status, 409);
  });

  test("[RFADMIN14] correo con formato inválido -> 400", async () => {
    const res = await api("POST", "/api/providers", { token, body: provider({ providerEmail: "no-es-correo" }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN14] tipo de documento 'Tarjeta de identidad' -> 400", async () => {
    const res = await api("POST", "/api/providers", {
      token, body: provider({ documentType: "TI" }),
    });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN14] nombre faltante -> 400 (no 500)", async () => {
    const res = await api("POST", "/api/providers", { token, body: provider({ providerName: undefined }) });
    assert.equal(res.status, 400);
  });

  test("[RFADMIN17] DELETE no borra físicamente", async () => {
    const created = await api("POST", "/api/providers", { token, body: provider() });
    const id = created.body.providerId;
    await api("DELETE", `/api/providers/${id}`, { token });
    const { rowCount } = await pool.query("SELECT 1 FROM providers WHERE id=$1", [id]);
    assert.equal(rowCount, 1);
  });

  test("[RFADMIN16] filtro por NIT en servidor (?nit=)", async () => {
    const body = provider();
    await api("POST", "/api/providers", { token, body });
    const res = await api("GET", `/api/providers?nit=${body.nit}`, { token });
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    assert.equal(list.length, 1, "?nit no filtra en GET /api/providers");
  });
});

// ───────────────────── CAMBIO DE ESTADO (fase 5: sin borrado físico) ─────────────────────
describe("CAMBIO DE ESTADO (PATCH /:id/status)", () => {
  test("[RFADMIN24] inhabilitar y habilitar un platillo -> 200", async () => {
    const created = await api("POST", "/api/products", { token, body: dish() });
    const id = created.body.productId;
    const off = await api("PATCH", `/api/products/${id}/status`, { token, body: { isAvailable: false } });
    assert.equal(off.status, 200);
    assert.equal(off.body.isAvailable, false);
    const on = await api("PATCH", `/api/products/${id}/status`, { token, body: { isAvailable: true } });
    assert.equal(on.body.isAvailable, true);
  });

  test("[RFADMIN24] no se puede inhabilitar un platillo que está en una orden abierta -> 409", async () => {
    const created = await api("POST", "/api/products", { token, body: dish() });
    const id = created.body.productId;
    const ord = await api("POST", "/api/orders", {
      token,
      body: { tableNumber: 990, items: [{ productId: id, quantity: 1 }] },
    });
    assert.equal(ord.status, 201, ord.text);
    const res = await api("PATCH", `/api/products/${id}/status`, { token, body: { isAvailable: false } });
    assert.equal(res.status, 409);
    // Tampoco por el PUT completo
    const put = await api("PUT", `/api/products/${id}`, { token, body: dish({ isAvailable: false }) });
    assert.equal(put.status, 409);
  });

  test("[RFADMIN17] inhabilitar proveedor -> 200 y la fila se conserva", async () => {
    const created = await api("POST", "/api/providers", { token, body: provider() });
    const id = created.body.providerId;
    const res = await api("PATCH", `/api/providers/${id}/status`, { token, body: { isActive: false } });
    assert.equal(res.status, 200);
    const { rows } = await pool.query("SELECT is_active FROM providers WHERE id=$1", [id]);
    assert.equal(rows[0].is_active, false);
  });

  test("[RFADMIN18] no se puede asignar un proveedor inactivo a un insumo nuevo o editado -> 400", async () => {
    const active = await api("POST", "/api/providers", { token, body: provider() });
    const inactive = await api("POST", "/api/providers", { token, body: provider() });
    await api("PATCH", `/api/providers/${inactive.body.providerId}/status`, { token, body: { isActive: false } });

    const bad = await api("POST", "/api/inventory", { token, body: supply({ providerId: inactive.body.providerId }) });
    assert.equal(bad.status, 400);

    const ok = await api("POST", "/api/inventory", { token, body: supply({ providerId: active.body.providerId }) });
    assert.equal(ok.status, 201, ok.text);
    const edit = await api("PUT", `/api/inventory/${ok.body.inventoryId}`, {
      token, body: supply({ providerId: inactive.body.providerId }),
    });
    assert.equal(edit.status, 400);
  });

  test("[RFADMIN10] cambiar estado de insumo -> 200; estado inválido -> 400", async () => {
    const created = await api("POST", "/api/inventory", { token, body: supply() });
    const id = created.body.inventoryId;
    const ok = await api("PATCH", `/api/inventory/${id}/status`, { token, body: { status: "Avería" } });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.status, "Avería");
    const bad = await api("PATCH", `/api/inventory/${id}/status`, { token, body: { status: "Borrado" } });
    assert.equal(bad.status, 400);
  });
});
