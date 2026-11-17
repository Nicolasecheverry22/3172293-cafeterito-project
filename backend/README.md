# Cafeterito — Backend

API REST del POS de Cafeterito (restaurante SENA).
Stack: **Node.js (ESM) + Express 5 + PostgreSQL (`pg`) + JWT + bcrypt + Joi**.

Arquitectura por features: `src/features/<modulo>/{routes, controller, service, repository, schema}.js`.

```
src/
├── app.js                 middlewares, rutas, 404 y manejador de errores
├── server.js              arranque (valida variables de entorno)
├── config/db.js           pool de PostgreSQL
├── middlewares/           auth (JWT), validate (Joi), error, rateLimit, permission
├── utils/                 httpError, joi (mensajes en español), listQuery, mailer, passwordPolicy…
└── features/              auth, users, products, inventory, providers, orders, groups, permissions, access
database/
├── migrate.js             runner de migraciones (con schema_migrations y --baseline)
├── migration-detectors.js detectores para el modo baseline
├── seed-admin.js          crea el administrador inicial
└── migrations/            0001 … 0037 (.sql)
tests/                     pruebas funcionales (node:test + fetch)
```

---

## 1. Instalación

Requisitos: **Node.js 20+** y **PostgreSQL 14+ con ICU** (las distribuciones oficiales lo incluyen; se usa para el orden alfabético en español).

```bash
cd backend
npm install
cp .env.example .env      # completar los valores (ver sección 2)
npm run migrate           # crea la BD si no existe y aplica las migraciones
npm run seed:admin        # crea el administrador inicial (solo en una BD nueva)
npm run dev               # http://localhost:4000 (nodemon)
```

Producción: `npm start`.

---

## 2. Variables de entorno

Plantilla completa en [`.env.example`](.env.example). **Nunca subas `.env` al repositorio.**

| Variable | Obligatoria | Descripción |
|----------|:-:|-------------|
| `PORT` | | Puerto HTTP (por defecto `4000`). |
| `NODE_ENV` | | `production` desactiva la impresión en consola de los códigos de recuperación. |
| `CORS_ORIGIN` | | Orígenes permitidos, separados por comas (por defecto `http://localhost:5173`). |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME` | ✔ | Conexión a PostgreSQL. |
| `DB_PASSWORD` | ✔ (puede ir vacía) | Contraseña de PostgreSQL. |
| `DB_SORT_COLLATION` | | Collation para el orden alfabético (por defecto `es-x-icu`). Usa `default` si tu PostgreSQL no tiene ICU. |
| `JWT_SECRET` | ✔ | Secreto largo y aleatorio: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. |
| `JWT_EXPIRES` | | Duración del token. **`10m`** (RNF09); el frontend lo renueva con `/api/auth/refresh` mientras haya actividad. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | para `seed:admin` | Administrador inicial. La contraseña debe cumplir RNF10. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | | Envío del código de recuperación. Sin `SMTP_HOST` y fuera de producción, el código se imprime en la consola. |
| `RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_LOGIN_MAX`, `RATE_LIMIT_RESET_MAX` | | Rate limiting de `/api/auth` (por defecto 15 min, 20 logins y 5 solicitudes de recuperación por IP). |

Si falta una variable obligatoria, el servidor no arranca y dice cuál falta.

---

## 3. Migraciones

```bash
npm run migrate                  # aplica solo las migraciones pendientes
npm run migrate -- --baseline    # bases creadas ANTES de schema_migrations (ver abajo)
```

- Las migraciones aplicadas se registran en `schema_migrations`; cada archivo corre en su propia transacción y el proceso se detiene en el primer error indicando el archivo.
- **Base existente del equipo:** si `npm run migrate` responde *"ya tiene tablas pero ninguna migración registrada"*, haz un respaldo y ejecuta `npm run migrate -- --baseline`, luego `npm run migrate`. Procedimiento completo y advertencias (p. ej. `0028` borra los roles Instructor/Aprendiz) en [`database/README.md`](database/README.md).
- Las migraciones `0031`–`0036` validan los datos existentes (correos duplicados, NIT repetidos, precios ≤ 0…) y **se detienen con un mensaje claro** si encuentran conflictos, sin modificar nada.
- Nunca edites una migración ya aplicada: crea `0038_...sql` y agrega su detector en `database/migration-detectors.js`.

## 4. Administrador inicial

```bash
npm run seed:admin
```

Lee `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` de `.env`, valida la contraseña (RNF10), y crea el usuario con el rol **Administrador** e `is_superuser = true`. Si ya existe un usuario con ese correo, no hace nada.

---

## 5. Pruebas

```bash
npm run test:setup   # recrea la base de PRUEBAS (cafeterito_test) y aplica las migraciones
npm test             # ejecuta la suite (node:test)
```

- La suite **nunca** usa la base de `.env`: toma `TEST_DB_NAME` (por defecto `cafeterito_test`) y aborta si el nombre no termina en `_test`.
- Levanta la app en memoria, crea un admin de prueba directamente en la BD y borra al final todo lo creado (prefijo `TEST_` / `test_`, mesas ≥ 900).
- Archivos: `auth`, `users`, `catalog` (menú, inventario, proveedores, listados), `orders` (+ transversales) y `ratelimit`.

---

## 6. Convenciones de la API

- **Autenticación:** `Authorization: Bearer <token>` en todas las rutas salvo `/api/auth/*` (excepto `/refresh`) y `GET /api/products/top-selling`. Un token de un usuario deshabilitado o bloqueado deja de funcionar de inmediato (401).
- **Errores:** siempre JSON `{ "error": "mensaje" }`. Las validaciones devuelven `400` con `details: [{ field, message }]` (mensajes en español). Los errores internos responden `500 "Error interno del servidor"`, sin detalles de PostgreSQL ni stack.
- **Códigos:** `400` validación · `401` sin token / token inválido / credenciales · `404` no existe · `409` duplicado o regla de negocio · `423` cuenta bloqueada · `429` demasiadas solicitudes.
- **Sin borrado físico:** no existen rutas `DELETE`. Se usa `PATCH /:id/status` (o `PATCH /api/orders/:id/cancel`).
- **Listados (`GET /`):** sin `?page` y `?limit` la respuesta es un **array** con todos los registros filtrados. Con `?page=1&limit=20` (máx. 100) la respuesta es `{ data, total, page, limit }`. Orden: alfabético por nombre (órdenes: más recientes primero).

---

## 7. Endpoints

| Método | Ruta | Auth | Validación / notas |
|--------|------|:----:|--------------------|
| **Auth** | | | |
| POST | `/api/auth/login` | — | `{ email, password }`. 401 credenciales, **423** tras 3 fallos (bloqueo 15 min), rate limit. |
| POST | `/api/auth/refresh` | ✔ | Devuelve un token nuevo de `JWT_EXPIRES`. |
| POST | `/api/auth/forgot-password` | — | `{ email }`. Siempre 200 con el mismo mensaje; envía un código de 6 dígitos (15 min). |
| POST | `/api/auth/verify-reset-token` | — | `{ email, token }`. 400 si es inválido, vencido o usado (máx. 5 intentos por código). |
| POST | `/api/auth/reset-password` | — | `{ email, token, password }`. Política RNF10; el código es de un solo uso. |
| GET | `/api/access/check/:permissionCode` | ✔ | `{ granted }` (lógica de permisos fuera de alcance). |
| **Usuarios** | | | |
| GET | `/api/users` | ✔ | `?search&isActive&page&limit` |
| GET | `/api/users/report-data` | ✔ | `?document` |
| GET | `/api/users/:id` | ✔ | id entero positivo |
| POST | `/api/users` | ✔ | Joi: nombre (letras), correo, documento `\d{1,15}`, teléfono `\d{7,15}`, dirección 10–100, correo personal ≠ empresarial, contraseña RNF10, `groupNames` ≥ 1 y existentes. **Ignora `isSuperuser`/`isStaff`/`isActive`.** |
| PUT | `/api/users/:id` | ✔ | Igual que POST, sin contraseña; `isActive` opcional. |
| PATCH | `/api/users/:id/status` | ✔ | `{ isActive }`. Reactivar desbloquea; nadie puede desactivarse a sí mismo. |
| GET | `/api/users/:id/permissions` | ✔ | Permisos directos + heredados. |
| PUT | `/api/users/:id/permissions` | ✔ | `{ permissionIds }` |
| **Grupos / permisos** (lógica fuera de alcance) | | | |
| GET | `/api/groups` | ✔ | |
| GET | `/api/groups/:groupId/permissions` | ✔ | |
| PUT | `/api/groups/:groupId/permissions` | ✔ | `{ permissionIds }` |
| GET | `/api/permissions` | ✔ | |
| **Menú (platillos)** | | | |
| GET | `/api/products/top-selling` | — | Público (Home). |
| GET | `/api/products` | ✔ | `?search&category&isAvailable&page&limit` |
| GET | `/api/products/report-data` | ✔ | `?category` |
| GET | `/api/products/:id` | ✔ | |
| POST | `/api/products` | ✔ | Nombre y categoría obligatorios, precio > 0; nombre único por categoría (409). |
| PUT | `/api/products/:id` | ✔ | Igual que POST. |
| PATCH | `/api/products/:id/status` | ✔ | `{ isAvailable }`. 409 si el platillo está en una orden abierta. |
| **Inventario** | | | |
| GET | `/api/inventory` | ✔ | `?search&category&status&providerId&page&limit` |
| GET | `/api/inventory/report-data` | ✔ | `?category&status` |
| GET | `/api/inventory/:id` | ✔ | |
| POST | `/api/inventory` | ✔ | Stock/mínimo ≥ 0, máximo ≥ mínimo, estado `Disponible/Vencido/Avería/Agotado`, `barcode` único obligatorio, `expirationDate` (AAAA-MM-DD), `providerId` (proveedor activo); lote único por insumo. |
| PUT | `/api/inventory/:id` | ✔ | Igual que POST (si cambia el proveedor, debe estar activo). |
| PATCH | `/api/inventory/:id/status` | ✔ | `{ status }` |
| **Proveedores** | | | |
| GET | `/api/providers` | ✔ | `?search&nit&documentType&isActive&page&limit` |
| GET | `/api/providers/report-data` | ✔ | `?nit` |
| GET | `/api/providers/:id` | ✔ | |
| POST | `/api/providers` | ✔ | `documentType` ∈ NIT, CC, CE, PEP, PPT (sin TI; por defecto NIT); documento numérico (NIT con dígito de verificación opcional) y único; correo válido; nombre y teléfono obligatorios. |
| PUT | `/api/providers/:id` | ✔ | Igual que POST. |
| PATCH | `/api/providers/:id/status` | ✔ | `{ isActive }` |
| **Órdenes** | | | |
| GET | `/api/orders` | ✔ | `?status&tableNumber&from&to&page&limit` (más recientes primero) |
| GET | `/api/orders/report-data` | ✔ | `?tableNumber` |
| GET | `/api/orders/:id` | ✔ | |
| POST | `/api/orders` | ✔ | Mesa entera > 0, ≥ 1 platillo, cantidades enteras > 0, solo platillos habilitados; precio y total calculados en el servidor; una orden abierta por mesa (409); `waiterId` opcional (por defecto el usuario autenticado; si se envía, debe estar activo). |
| PUT | `/api/orders/:id` | ✔ | 409 si la orden está pagada o cancelada. Transiciones: `activa ↔ lista para entrega → pagada / cancelada`. |
| PATCH | `/api/orders/:id/cancel` | ✔ | Anular: solo `activa` o `lista para entrega`; si no, 409. |
