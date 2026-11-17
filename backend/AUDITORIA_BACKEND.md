# Auditoría del backend — Cafeterito

**Fecha:** 2026-11-16 · **Rama:** `task/test-dark-mode-search-fixes` · **Alcance:** `backend/` (users, auth, products/menú, inventory, providers, orders, configuración, migraciones).
**Fuera de alcance:** el funcionamiento interno de `features/permissions`, `features/groups`, `features/access` y `middlewares/permission.middleware.js` (solo se anotan dependencias e impactos).

**Entorno de prueba:** PostgreSQL local, base dedicada **`cafeterito_test`** (creada desde cero con las 30 migraciones). La base de desarrollo de `.env` (`cafeterito_database` en localhost) **no se tocó**. Todos los datos de prueba llevan prefijo `TEST_` (o mesas ≥ 900) y se borran al terminar; se verificó que quedaron 0 filas residuales.

---

## 1. Resumen ejecutivo

**Estado general: NO apto para producción.** El backend arranca sin errores y su base técnica es buena (SQL 100 % parametrizado, contraseñas con bcrypt, transacciones en órdenes y usuarios, total de la orden calculado en el servidor, una sola orden activa por mesa garantizada en la BD). Pero **la API no tiene ninguna capa de seguridad efectiva**: de 39 endpoints, solo 1 exige token, y la creación de usuarios acepta `isSuperuser` desde el cliente. Además, la validación de entrada es casi inexistente (Joi está instalado pero **no se usa en ningún archivo**), todos los módulos borran físicamente, y faltan módulos enteros que piden los requerimientos (recuperación de contraseña, bloqueo por intentos, auditoría, categorías de menú, código de barras, relación proveedor–producto).

**Pruebas funcionales:** 99 pruebas → **30 pasan / 69 fallan** (cada falla corresponde a un requerimiento no cumplido; ver §4).

### Los 5 problemas más críticos

| # | Problema | Impacto |
|---|----------|---------|
| 1 | **Ninguna ruta de negocio usa `authenticateToken`** (users, products, inventory, providers, orders, groups, permissions). Solo `/api/access/check` está protegida. | Cualquiera en la red puede listar, crear, modificar y **borrar** usuarios, productos, proveedores y órdenes sin iniciar sesión. |
| 2 | **Escalada de privilegios:** `POST /api/users` (sin auth) guarda `isSuperuser`, `isStaff` e `isActive` tal como llegan en el body. Probado de punta a punta: anónimo → crea superusuario → login → `granted: true` para cualquier permiso. | Toma total del sistema en una sola petición. |
| 3 | **El runner de migraciones no lleva registro y `0028` no es idempotente.** Toda ejecución de `npm run migrate` sobre una base existente falla en `0028` (`groups_group_name_key`), así que `0029`, `0030` y cualquier migración futura **nunca se aplican** en las bases del equipo. Además, `0028` y `0002` **borran datos**. | Bases del equipo desincronizadas; despliegues imposibles sin recrear la BD. |
| 4 | **Sin validación de entrada en los POST** (products, inventory, providers, users): se aceptan precios negativos, stock negativo, estados inventados, NIT vacío o repetido, correos inválidos, contraseña `"123"`, documento `"ABC"`. Los campos faltantes terminan en **500 con el mensaje crudo de PostgreSQL**. | Datos corruptos y filtración de detalles internos. |
| 5 | **Órdenes pagadas o canceladas se pueden modificar** (ítems, estado, mesa) y una pagada puede pasar a cancelada; una cancelada se puede borrar. Además, **todos los módulos hacen `DELETE` físico** (contradice RFADMIN05/10/17/24). | Pérdida de historial de ventas y descuadre de caja. |

Otros hallazgos graves: no hay bloqueo tras 3 intentos (RNF11); el JWT dura 1 h y no existe cierre por inactividad (RNF09); no hay flujo de recuperación de contraseña en el backend aunque el frontend tiene el formulario; no hay auditoría (RNF02); `POST /api/users` **registra la contraseña en texto plano en la consola** (`user.controller.js:15`); falta el estado "lista para entrega" en órdenes.

---

## 2. Tabla de hallazgos

Severidad: **C** = Crítica · **A** = Alta · **M** = Media · **B** = Baja. Las rutas de archivo son relativas a `backend/`.

### 2.1 Seguridad y configuración general

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H01 | Todos | Riesgo de seguridad | C | RNF (seguridad), RFADMIN01 | Ninguna ruta de negocio usa `authenticateToken`. `requirePermission` existe pero no se usa en ningún router. | `src/features/*/*.routes.js` (p. ej. `users/user.routes.js:7-22`, `orders/order.routes.js:6-11`) | `curl http://localhost:4000/api/users` → 200 con todos los usuarios | En `app.js`, montar `authenticateToken` en cada router salvo `/api/auth`, p. ej. `app.use("/api/users", authenticateToken, userRoutes)`, y añadir `requirePermission("list_user")`, etc., por ruta. |
| H02 | Users | Riesgo de seguridad | C | RFADMIN02 | `createUser` hace `...data`, así que `isSuperuser`, `isStaff` e `isActive` vienen del cliente sin control. El frontend envía `isSuperuser` desde el formulario (`frontend/.../CreateUserPage.jsx:45`). | `src/features/users/user.service.js:36-39`; `user.repository.js:25-36` | `POST /api/users` sin token con `{"isSuperuser":true, "groupNames":["Invitado"], ...}` → login → `GET /api/access/check/delete_order` → `granted:true` (prueba `[SEG] ... cadena completa`) | Construir `userData` campo por campo (como en `updateUser`), calcular `isSuperuser = groupNames.includes("Administrador")` en el servidor, ignorar `isStaff` y exigir auth + permiso `create_user`. |
| H03 | Groups / Permissions | Riesgo de seguridad | C | — | (Dependencia, fuera de alcance) `PUT /api/groups/:id/permissions`, `PUT /api/users/:id/permissions` y `GET /api/permissions` también carecen de auth: cualquiera puede darse permisos. | `src/features/groups/groups.routes.js:8-10`, `users/user.routes.js:13-14`, `permissions/permissions.routes.js:8` | `curl http://localhost:4000/api/permissions` → 200 | Igual que H01. |
| H04 | Users / Auth | Riesgo de seguridad | A | RNF08 | `console.log("BODY RECIBIDO:", req.body)` imprime la **contraseña en texto plano** en los logs; `auth.service.js` imprime el usuario **con su hash**. | `src/features/users/user.controller.js:15`; `src/features/auth/auth.service.js:12` | Crear un usuario y mirar la consola del servidor | Eliminar ambos `console.log` o usar un logger que oculte `userPassword`/`user_password`. |
| H05 | Global | Riesgo de seguridad | A | RNF | No hay middleware global de errores: un JSON malformado devuelve una **página HTML con stack trace y rutas del servidor**. | `src/app.js:29-40` | `curl -X POST /api/auth/login -H "Content-Type: application/json" -d "{bad"` → 400 HTML con `node_modules\body-parser...` | Añadir al final de `app.js`: `app.use((err, req, res, next) => { const s = err.status \|\| 500; res.status(s).json({ error: s < 500 ? err.message : "Error interno" }); })`. |
| H06 | Todos | Riesgo de seguridad | A | RNF | Todos los controllers responden `err.message` en los 500, lo que **filtra mensajes de PostgreSQL** (nombres de constraints, tipos, tablas). | p. ej. `products/product.controller.js:13`, `inventory/inventory.controller.js:13`, `users/user.controller.js:41` | `GET /api/products/abc` → `500 {"error":"la sintaxis de entrada no es válida para tipo integer: «NaN»"}`; `DELETE /api/products/<vendido>` → `500 "...violates RESTRICT setting of foreign key constraint fk_order_items_product..."` | Devolver un mensaje genérico en 5xx y loguear el detalle; mapear `23505`→409, `23503`→409/400 y `22P02`→400 en el handler global. |
| H07 | Global | Falta | M | RNF | No hay handler de ruta 404: Express responde con HTML. | `src/app.js:39` | `GET /api/no-existe` → 404 `text/html` | `app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }))` antes del handler de errores. |
| H08 | Global | Mejora | M | RNF | CORS fijo a `http://localhost:5173`; no es configurable por `.env`. El frontend también tiene `http://localhost:4000` fijo en 6+ archivos. | `src/app.js:27`; `frontend/src/features/login/services/authService.js:1` | — | `cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:5173" })`; en el frontend usar `import.meta.env.VITE_API_URL`. |
| H09 | Global | Falta | M | RNF11 | No hay rate limiting ni cabeceras de seguridad (`helmet`); `X-Powered-By: Express` está expuesto. | `src/app.js` | `curl -i` cualquier ruta | Añadir `helmet()` y `express-rate-limit` en `/api/auth`, y `app.disable("x-powered-by")`. |
| H10 | Global | Mejora | B | — | `server.js` importa `app` antes de llamar a `dotenv.config()`. Hoy funciona solo porque `db.js` también lo llama. `JWT_SECRET` mide 21 caracteres (se recomiendan ≥ 32 aleatorios). `nodemon` está en `dependencies`. | `src/server.js:3-11` | — | Usar `import "dotenv/config"` como primera línea de `server.js`; validar al arrancar que existan `JWT_SECRET`/`DB_*` y abortar si faltan; generar un secreto de 64 bytes; mover `nodemon` a `devDependencies`. |
| H11 | Global | Falta | A | RNF | **Joi está en `package.json` pero no se importa en ningún archivo.** La validación es manual y solo existe en algunos `update`. | `package.json` (dependencia); `grep -r joi src` → 0 resultados | — | Crear `src/middlewares/validate.middleware.js` (`validate(schema)`) y un `*.schema.js` por feature para POST/PUT/PATCH. |

### 2.2 Migraciones y esquema

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H12 | Migraciones | Falla | C | — | El runner ejecuta **todas** las migraciones en cada corrida, sin tabla de control ni transacción por archivo. `0028` hace `INSERT` sin `ON CONFLICT`, así que la segunda ejecución falla y **las migraciones posteriores (0029, 0030, …) nunca se aplican** sobre una base existente. | `database/migrate.js:57-75`; `database/migrations/0028_update_groups_roles.sql:5-10` | `npm run migrate` dos veces → `llave duplicada viola restricción de unicidad «groups_group_name_key»` (verificado) | Crear una tabla `schema_migrations(filename PK, applied_at)`, saltar las ya aplicadas y envolver cada archivo en `BEGIN/COMMIT`. Inmediato: añadir `ON CONFLICT (group_name) DO NOTHING` en `0028`. |
| H13 | Migraciones | Riesgo | A | — | `0028` hace `DELETE FROM groups WHERE group_name IN ('Instructor','Aprendiz')`; por el `ON DELETE CASCADE`, los usuarios con esos roles **pierden su rol** sin aviso. `0018` los crea y `0028` los borra. | `database/migrations/0028_update_groups_roles.sql:1-2` | — | No borrar datos en migraciones de esquema: inactivar (`is_active=false`) o migrar los usuarios a otro grupo antes. |
| H14 | Migraciones | Falla | A | RFADMIN02 | `0001` crea `user_address`/`user_lastname` como `NOT NULL` y `0002` (nombre engañoso, `..._delete_data_table`) **los elimina**. Hoy no existe la columna dirección, aunque RFADMIN02 exige una dirección de 10–100 caracteres. | `0001_create_users_table.sql:8-9`; `0002_edit_column_and_delete_data_table.sql:13-14` | `\d users` → sin `user_address` | Nueva migración `ADD COLUMN user_address VARCHAR(100)` + CHECK `char_length BETWEEN 10 AND 100`; renombrar o documentar `0002`. |
| H15 | Esquema | Falta | A | RFADMIN14 | `providers.nit` no es `NOT NULL` ni `UNIQUE`; no existe la columna `document_type`. | `0026_create_providers_table.sql:4` | Crear 2 proveedores con el mismo NIT → 201 y 201 | `ALTER TABLE providers ALTER nit SET NOT NULL, ADD CONSTRAINT uq_providers_nit UNIQUE(nit), ADD COLUMN document_type VARCHAR(10) NOT NULL CHECK (document_type IN ('NIT','CC','CE','PAS'))`. |
| H16 | Esquema | Falta | A | RFADMIN08 | No existe la columna **código de barras** en `inventory` ni en `products`; tampoco hay FK `inventory → providers` ni fecha de vencimiento (necesaria para el estado "Vencido"). | `0023_create_inventory_table.sql` | Prueba `código de barras único` | `ADD COLUMN barcode VARCHAR(50) UNIQUE NOT NULL, provider_id INT REFERENCES providers(id), expiration_date DATE`. |
| H17 | Esquema | Falta | M | RFADMIN20 | `products` no tiene `UNIQUE(product_name, category)` ni `CHECK (price > 0)`; `category` es texto libre (no hay tabla de categorías); `is_available` admite NULL. | `0022_create_products_table.sql:2-10` | Prueba `nombre único por categoría` → 201 | Tabla `menu_categories` + FK, `UNIQUE(category_id, lower(product_name))`, `CHECK(price>0)`, `is_available NOT NULL`. |
| H18 | Esquema | Falta | M | RFADMIN08 | `inventory.status` es texto libre (default `'Activo'`) sin CHECK; los seeds usan `Activo`/`Averia` en lugar de `Disponible`/`Avería`; `stock`/`min_stock` no tienen `CHECK >= 0`. | `0023_create_inventory_table.sql:7-12`; `0025_seed_inventory.sql` | `SELECT DISTINCT status FROM inventory` → Activo, Agotado, Averia, Vencido | Normalizar los datos y añadir `CHECK (status IN ('Disponible','Vencido','Avería','Agotado'))`, `CHECK (stock >= 0)`, `CHECK (max_stock >= min_stock)`. |
| H19 | Esquema | Falla | A | RFADMIN05 | `users.is_active`/`is_superuser` admiten NULL y el INSERT pasa `undefined`→NULL cuando el cliente no envía el campo. Un usuario creado sin `isActive` **no puede iniciar sesión** ("Usuario inactivo"). | `0001_create_users_table.sql:12-14`; `user.repository.js:56-67` | `POST /api/users` sin `isActive` → login → 401 "Usuario inactivo" (prueba) | `ALTER COLUMN ... SET NOT NULL` (con DEFAULT) y no enviar el campo en el INSERT cuando sea `undefined`. |
| H20 | Esquema | Falta | M | RNF02 | No hay columnas `updated_at`/`updated_by`/`created_by` (salvo `orders.updated_at`) ni tabla de auditoría. | todas las migraciones | Pruebas `[RNF02]` | Tabla `audit_log(id, user_id, entity, entity_id, action, changes JSONB, created_at TIMESTAMPTZ)` alimentada desde los services (con `req.user.id`). |
| H21 | Esquema | Falta | M | RFADMIN01 | No hay seed de un usuario administrador inicial: en una base nueva hay 0 usuarios y la única forma de crear el primero es la ruta `POST /api/users` sin auth. | `database/migrations/*` | `SELECT count(*) FROM users` → 0 | Script `npm run seed:admin` que lea las credenciales de variables de entorno (no de una migración versionada). |
| H22 | Migraciones | Mejora | B | — | Nombres confusos: `0008_create_user_permission.sql` en realidad inserta permisos, `0010_insert_grop_permissions` (errata) y `0019` crea `list_order` en el módulo equivocado (lo corrige `0030`). `schemas/users/users.sql` es un duplicado sin uso. La constraint sigue llamándose `users_password_not_null` tras el rename. Las fechas son `TIMESTAMP` sin zona horaria. | `database/migrations/` | — | No renombrar migraciones ya aplicadas; documentarlo en un README. Eliminar `schemas/`; usar `TIMESTAMPTZ` en tablas nuevas. |

### 2.3 Auth

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H23 | Auth | Falta | C | RNF11 | No hay bloqueo tras 3 intentos fallidos: no existen columnas `failed_attempts`/`locked_until` ni la lógica. | `src/features/auth/auth.service.js:9-43` | 3 logins fallidos y luego el correcto → 200 (prueba `[RNF11]`) | Columnas `failed_login_attempts INT DEFAULT 0` y `locked_until TIMESTAMPTZ`; incrementar en cada fallo; con ≥ 3, bloquear (423) N minutos o hasta que un admin desbloquee; reiniciar al acertar. |
| H24 | Auth | Falla | A | RNF09 | El JWT dura `JWT_EXPIRES=1h`; no hay cierre por inactividad de 10 min, refresh token ni logout. | `auth.service.js:30-34`; `.env` (`JWT_EXPIRES`) | Decodificar el token: `exp - iat = 3600` | Token de acceso de 10 min + refresh deslizante (o renovar en cada petición si quedan < 10 min); `POST /api/auth/logout` con lista de revocación. |
| H25 | Auth | Falta | A | RFADMIN01 | No existe en el backend el flujo de **olvidé mi contraseña / reset** (el frontend ya tiene `ForgotPasswordForm.jsx`). | `src/features/auth/auth.routes.js:10` | `POST /api/auth/forgot-password` → 404 | Tabla `password_reset_tokens(user_id, token_hash, expires_at, used_at)`; token aleatorio de 32 bytes, guardado como hash, que expire en 15–30 min y sea de un solo uso; responder siempre 200 para no revelar qué correos existen. |
| H26 | Auth | Falla | M | RFADMIN01 | Login sin validación: todo error responde **401**, incluso una caída de la BD (debería ser 500) o un body sin `password` (devuelve el mensaje interno de bcrypt, *"data and hash arguments required"*, cuando el correo existe). | `src/features/auth/auth.controller.js:14-18` | `POST /login {"email":"<existente>"}` → 401 con mensaje de bcrypt | Esquema Joi `{email, password}` → 400; distinguir errores de credenciales (401) de los demás (500). |
| H27 | Auth | Mejora | B | RFADMIN05 | El token sigue siendo válido si el usuario es deshabilitado o se le quitan permisos durante la vigencia del JWT. El middleware no verifica el esquema `Bearer`. | `src/middlewares/auth.middleware.js:17-31` | Deshabilitar un usuario con sesión → sus peticiones siguen siendo aceptadas | Con token de 10 min es aceptable; opcionalmente verificar `is_active` en el middleware. Validar `scheme === "Bearer"`. |

### 2.4 Usuarios

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H28 | Users | Falta | A | RNF10, RFADMIN02 | La única regla de contraseña es "no vacía". Se acepta `"123"`. **Inconsistencia de requerimientos:** RNF10 pide mínimo 10 caracteres con mayúscula, minúscula, número y símbolo; RFADMIN01/02 dicen 8–10. Hay que definir cuál rige (se recomienda RNF10: mínimo 10, sin máximo bajo). | `src/features/users/user.service.js:24-26` | `POST /api/users` con `userPassword:"123"` → 201 | Joi: `.min(10).max(64).pattern(/[a-z]/).pattern(/[A-Z]/).pattern(/\d/).pattern(/[^\w\s]/)`. |
| H29 | Users | Falta | A | RFADMIN02 | Sin validación en la creación: correo con formato inválido, documento no numérico o > 15 dígitos, teléfono con letras o < 7 dígitos y nombre vacío se aceptan (201). Sin correo → **500** (NOT NULL). | `user.service.js:23-42` | Pruebas `USUARIOS — validaciones` | Esquema Joi: `email()`, `userDocumentNumber: /^\d{1,15}$/`, `userPhone: /^\d{7,15}$/`, `userAddress: min(10).max(100)`, `userName` obligatorio. |
| H30 | Users | Falla | M | RFADMIN02 | El correo se pasa a minúsculas al **editar** pero no al **crear**, así que `Ana@x.com` y `ana@x.com` quedan como usuarios distintos (el UNIQUE distingue mayúsculas). El login hace una comparación exacta. | `user.service.js:59` vs `:36-39`; `auth.repository.js:10` | Crear `test_1@x.com` y `TEST_1@X.COM` → ambos 201 | Normalizar con `trim().toLowerCase()` en la creación y en el login; índice `UNIQUE (lower(user_email))`. |
| H31 | Users | Falta | M | RFADMIN02 | No existen los campos **correo personal** (para validar empresarial ≠ personal) ni **dirección** (ver H14). | `0001`/`0002`; `user.repository.js` | — | `ADD COLUMN user_personal_email VARCHAR(150)` + regla en Joi/servicio `personal !== empresarial`. |
| H32 | Users | Falla | A | RFADMIN05 | `DELETE /api/users/:id` **borra físicamente** (con cascada a roles y permisos y `SET NULL` en las órdenes). El requerimiento es solo cambio de estado. | `user.repository.js:301-307`; `user.routes.js:22` | `DELETE /api/users/<id>` → la fila desaparece | Eliminar la ruta DELETE; crear `PATCH /api/users/:id/status {isActive}`. |
| H33 | Users | Falta | M | RFADMIN03 | Listado `ORDER BY id`, sin paginación ni filtros en el servidor. | `user.repository.js:253-271` | `GET /api/users` con 42 usuarios → devuelve 42 | `ORDER BY lower(user_name)`, con `?page&limit` (por defecto 20, `LIMIT/OFFSET`), `?search=` y respuesta `{data,total,page}`. |
| H34 | Users | Falla | M | RFADMIN02 | Si `groupNames` trae solo nombres inexistentes o inactivos, el usuario se crea **sin ningún rol** (el INSERT…SELECT no inserta nada y no se valida). Además, crear un usuario con rol "Administrador" deja `is_superuser = NULL` (al editar sí se calcula). | `user.repository.js:108-119`; `user.service.js:28-41` | `groupNames:["RolQueNoExiste"]` → 201 | Verificar `rowCount === groupNames.length` y, si no coincide, hacer ROLLBACK con 400; calcular `isSuperuser` igual que en `updateUser`. |
| H35 | Users | Falla | B | — | `Number(req.params.id)` con un id no numérico → NaN → 500 con mensaje de PG. Ocurre en todos los módulos. | `user.controller.js:63`; también products/inventory/providers/orders | `GET /api/users/abc` → 500 | Validar el parámetro con Joi (`id: number().integer().positive()`) → 400. |

### 2.5 Menú (products)

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H36 | Products | Falta | A | RFADMIN20 | `create` no valida nada (sí lo hace `update`): precio −5 → 201, categoría vacía → 201, precio `"abc"` o nombre faltante → 500. | `src/features/products/product.service.js:22-24` | Pruebas `MENÚ` | Reutilizar en `create` las mismas validaciones de `update` (o Joi), con `price > 0`. |
| H37 | Products | Falta | M | RFADMIN20 | Sin regla de **nombre único por categoría**. | `product.repository.js:5-15`; `0022` | Mismo platillo dos veces → 201, 201 | Constraint (ver H17) + mapear 23505 → 409. |
| H38 | Products | Falla | A | RFADMIN24 | `DELETE` físico. Si el platillo ya se vendió, la FK RESTRICT hace fallar el borrado con **500 y el nombre de la constraint**. | `product.repository.js:76-82` | `DELETE /api/products/<vendido>` → 500 "violates RESTRICT ... fk_order_items_product" | Quitar DELETE; usar `PATCH /:id/status` (habilitar/inhabilitar) con `is_available`. |
| H39 | Products | Falta | M | RFADMIN21, RFADMIN22 | **No existe backend de categorías de menú** (no hay tabla ni endpoints): la categoría es texto libre. `GET /api/products` ignora `?category`, `?search` y paginación (solo `/report-data` filtra por categoría). | `product.repository.js:17-30` | `GET /api/menu-categories` → 404; `GET /api/products?category=Bebidas` devuelve todas | Feature `menu-categories` (CRUD + estado) y filtros/paginación en `getAll`. |

### 2.6 Inventario

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H40 | Inventory | Falta | A | RFADMIN08 | `create` sin validación: stock negativo, estado `"Inventado"`, `maxStock < minStock` → 201; sin nombre → 500. Lote repetido permitido. | `src/features/inventory/inventory.service.js:22-24` | Pruebas `INVENTARIO` | Aplicar las validaciones de `update` en `create` + `status` en la lista permitida + `UNIQUE(provision_name, batch)`. |
| H41 | Inventory | Falla | M | RFADMIN08 | Estados inconsistentes: requerimiento `Disponible/Vencido/Avería/Agotado`; BD y seeds `Activo/Averia/...`; el frontend muestra "Activo"/"Agotado" según `row.original.isActive`, **una columna que `inventory` no tiene**. | `0025_seed_inventory.sql`; `frontend/src/features/inventory/table/InventoryColumns.jsx:94` | `GET /api/inventory` → no trae `isActive` | Unificar el catálogo de estados (constante compartida + CHECK en BD) y que el frontend use `status`. |
| H42 | Inventory | Falta | A | RFADMIN11, RFADMIN12 | El menú (`products`) **no está vinculado** al inventario: vender un platillo no descuenta stock, y un insumo vencido o agotado no impide la venta. La regla RFADMIN11 solo se cumple vía `products.is_available`, que se gestiona a mano. No hay alertas de stock mínimo. | `orders/order.service.js:42-68`; esquema | — | Tabla `product_ingredients(product_id, inventory_id, qty)`; al crear o pagar la orden validar y descontar stock en la misma transacción; endpoint `GET /api/inventory/low-stock`. |
| H43 | Inventory | Falla | A | RFADMIN10 | `DELETE` físico. | `inventory.repository.js:100-106` | `DELETE /api/inventory/<id>` → la fila desaparece | Cambio de estado en lugar de borrado. |

### 2.7 Proveedores

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H44 | Providers | Falta | A | RFADMIN14 | `create` sin validación: NIT ausente o repetido → 201, correo `"no-es-correo"` → 201, tipo de documento inexistente (no se valida ni se guarda), nombre faltante → 500. `update` solo exige texto no vacío. | `src/features/providers/provider.service.js:22-24, 31-42` | Pruebas `PROVEEDORES` | Joi: `documentType: valid('NIT','CC','CE','PAS')` (excluye TI), `nit: pattern(/^\d{6,15}(-\d)?$/)`, `email()`; constraints de H15. |
| H45 | Providers | Falta | A | RFADMIN15, RFADMIN18 | No hay relación proveedor ↔ producto/insumo, así que la regla "proveedor inhabilitado no se asocia a nuevos productos" no se puede implementar hoy. | esquema (`0023`, `0026`) | — | FK `inventory.provider_id` (H16) y validar `providers.is_active` al crear o editar el insumo. |
| H46 | Providers | Falla | A | RFADMIN17 | `DELETE` físico. | `provider.repository.js:104-110` | `DELETE /api/providers/<id>` | Quitar DELETE; `PATCH /:id/status`. |
| H47 | Providers | Falta | M | RFADMIN16 | `GET /api/providers` no filtra ni pagina (solo `/report-data?nit=`). | `provider.repository.js:34-49` | `GET /api/providers?nit=X` → 27 filas | Filtros `?nit&search&isActive&page&limit` en SQL. |

### 2.8 Órdenes

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H48 | Orders | Falla | C | RFADMIN28, RFADMIN29 | `update` no revisa el estado actual: una orden **pagada** puede volver a `activa`, cambiar ítems o mesa, o pasar a `cancelada`; una **cancelada** puede reactivarse. | `src/features/orders/order.service.js:70-113` | Pruebas `orden pagada NO se puede actualizar`, `cancelada NO se puede reactivar`, `pagada → cancelada` → 200 | Al inicio de `update`: `if (["pagada","cancelada"].includes(current.status)) throw httpError(409, ...)` y definir una matriz de transiciones válidas. |
| H49 | Orders | Falla | A | RFADMIN29 | `remove` solo bloquea `pagada`: una orden **cancelada** se borra físicamente (se pierde el historial). Además, borrar una orden activa equivale a "anular" sin dejar rastro. | `order.service.js:115-122` | `DELETE` de una orden cancelada → 200 | Eliminar el DELETE; anular = `status='cancelada'` con motivo y usuario. |
| H50 | Orders | Falta | M | RFADMIN30 | Falta el estado **"lista para entrega"**. BD (CHECK), backend (`VALID_STATUSES`) y frontend coinciden entre sí en `activa/pagada/cancelada` (más un "Pendiente" suelto en el frontend), pero ninguno tiene el estado requerido. | `order.service.js:24`; `0029_create_orders_tables.sql:13` | `PUT` con `status:"lista para entrega"` → 400 | Nueva migración que amplíe el CHECK (y el índice parcial, para que una orden "lista para entrega" siga contando como activa); constante compartida de estados. |
| H51 | Orders | Falla | M | RFADMIN26, RNF02 | El mesero (`waiterId`) lo envía el cliente y no se toma del token; puede ser cualquier usuario (inactivo o sin rol de mesero). No se registra quién creó, modificó o cobró la orden. | `order.service.js:46-47` | Crear una orden → `waiterId: null` | `waiterId = req.user.id` (o validar que el `waiterId` sea un mesero activo); `created_by`/`updated_by`. |
| H52 | Orders | Falta | M | RFADMIN31 | `GET /api/orders` no filtra ni pagina (solo `/report-data?tableNumber=`). | `order.repository.js:33-37` | `GET /api/orders?tableNumber=X` → devuelve todas | Filtros `?status&tableNumber&from&to&page&limit`. |
| H53 | Orders | Mejora | B | — | `handleError` traduce **todo** 23505 como "mesa con orden activa" y todo 23503 como "empleado no existe", aunque la causa sea otra (p. ej. borrar un producto vendido). | `order.controller.js:3-12` | — | Revisar `err.constraint` (`uq_orders_active_table`, `fk_orders_waiter`) antes de elegir el mensaje. |

### 2.9 Transversales

| ID | Módulo | Tipo | Sev. | Req. | Descripción | Archivo:línea | Cómo reproducirlo | Solución propuesta |
|----|--------|------|------|------|-------------|---------------|-------------------|--------------------|
| H54 | Todos | Falta | A | RNF02 | No hay bitácora: no se registra fecha, hora ni usuario en cada modificación (y sin auth tampoco hay usuario que registrar). | — | Pruebas `[RNF02]` | Ver H20; un helper `audit(client, req.user.id, entity, id, action, diff)` llamado dentro de la misma transacción. |
| H55 | Reportes | Parcial | M | RFADMIN07, 13, 19, 25, 31 | Existen endpoints de **datos** para reportes (`/report-data` en users, products, inventory, providers y orders) con un filtro básico; el PDF se genera en el frontend. Los endpoints no tienen auth, no filtran por fechas y `users/report-data` devuelve teléfono y correo de todos los usuarios a cualquiera. | `*/**.routes.js` (`/report-data`) | `GET /api/users/report-data` sin token → 200 | Protegerlos con el permiso `report_*`, añadir rango de fechas y estado, y paginar o hacer streaming si el volumen crece. |
| H56 | Todos | Mejora | B | — | Lógica duplicada (`httpError`, `requireText`, `requireNumber` copiados en 4 services; `requireNumber` está declarado y no se usa en `provider.service.js`). | `*/**.service.js` | — | Moverla a `src/utils/` o reemplazarla por Joi. |

---

## 3. Matriz de cobertura

> No hay documento de requerimientos en el repositorio. La descripción de cada RF se **infiere** del enunciado de la auditoría y del patrón CRUD de cada módulo (crear / consultar / listar-filtrar / actualizar / cambiar estado / reporte). Ajusten las etiquetas si el documento oficial difiere.

| Requerimiento | Descripción (inferida) | Estado | Hallazgos / evidencia |
|---------------|------------------------|--------|-----------------------|
| RFADMIN01 | Inicio de sesión, recuperación de contraseña | **Parcial** | Login + JWT funcionan; no hay forgot/reset (H25); validación nula (H26) |
| RFADMIN02 | Registrar usuario (validaciones de campos) | **No cumple** | H02, H28, H29, H30, H31, H34, H14 |
| RFADMIN03 | Consultar / listar usuarios (alfabético, paginado) | **Parcial** | Ver y listar funcionan sin hash; sin orden ni paginación (H33) |
| RFADMIN04 | Actualizar usuario | **Parcial** | Funciona y valida campos obligatorios; sin formato (H29), sin auth (H01) |
| RFADMIN05 | Habilitar/deshabilitar usuario (sin borrado) | **Parcial** | El cambio de estado y el bloqueo del login a inactivos funcionan; existe DELETE físico (H32); `is_active` NULL (H19) |
| RFADMIN06 | Búsqueda / filtro de usuarios | **No cumple** | Sin filtros en el servidor (H33) |
| RFADMIN07 | Reporte de usuarios | **Parcial** | `/report-data?document=` existe; sin auth (H55) |
| RFADMIN08 | Registrar insumo (ID/código de barras únicos, estados, lote, mínimo) | **No cumple** | H16, H18, H40, H41 |
| RFADMIN09 | Consultar / listar inventario | **Parcial** | Funciona; sin filtros ni paginación |
| RFADMIN10 | Actualizar / cambiar estado de insumo (sin borrado) | **Parcial** | `update` valida; DELETE físico (H43) |
| RFADMIN11 | Producto no disponible no se vende | **Parcial** | Se cumple vía `products.is_available` en órdenes (prueba ✔); no hay vínculo con el estado del inventario (H42) |
| RFADMIN12 | Lotes y cantidad mínima | **Parcial** | Las columnas `batch`/`min_stock` existen; sin unicidad de lote, sin alertas ni descuento de stock (H40, H42) |
| RFADMIN13 | Reporte de inventario | **Parcial** | `/report-data?category&status` (H55) |
| RFADMIN14 | Registrar proveedor (documento único, tipo, correo) | **No cumple** | H15, H44 |
| RFADMIN15 | Asociar proveedor a productos | **No cumple** | No existe la relación (H45) |
| RFADMIN16 | Listar / filtrar proveedores en el servidor | **No cumple** | H47 |
| RFADMIN17 | Inhabilitar proveedor (sin borrado) | **Parcial** | Hay `is_active` en `update`; DELETE físico (H46) |
| RFADMIN18 | Proveedor inhabilitado no se asocia a nuevos productos | **No cumple** | H45 |
| RFADMIN19 | Reporte de proveedores | **Parcial** | `/report-data?nit=` (H55) |
| RFADMIN20 | Registrar platillo (nombre único/categoría, precio > 0) | **No cumple** | H36, H37, H17 |
| RFADMIN21 | Categorías de menú | **No cumple** | Sin backend (H39) |
| RFADMIN22 | Listar / filtrar menú en el servidor | **No cumple** | H39 |
| RFADMIN23 | Actualizar platillo | **Cumple** | `update` valida nombre, categoría y precio > 0 (prueba ✔) — falta auth (H01) |
| RFADMIN24 | Habilitar/inhabilitar platillo (sin borrado) | **Parcial** | `is_available` existe; DELETE físico (H38) |
| RFADMIN25 | Reporte de menú | **Parcial** | `/report-data?category=` (H55) |
| RFADMIN26 | Crear orden (mesa única activa, platillos habilitados, cantidades > 0, total en servidor) | **Cumple** (con salvedades) | 9 pruebas ✔; salvedad: mesero no tomado del token (H51) |
| RFADMIN27 | Consultar órdenes | **Cumple** | `GET /api/orders`, `/:id` con ítems y total |
| RFADMIN28 | Actualizar orden (no si está pagada/cancelada) | **No cumple** | H48 |
| RFADMIN29 | Anular orden (no si está pagada/cancelada) | **No cumple** | H48, H49 (solo el DELETE de pagadas está bloqueado ✔) |
| RFADMIN30 | Estados coherentes de la orden | **Parcial** | Coherentes entre capas, pero falta "lista para entrega" (H50) |
| RFADMIN31 | Filtrar / reporte de órdenes | **Parcial** | `/report-data?tableNumber=`; `GET /` no filtra (H52) |
| RNF02 | Auditoría (fecha, hora y usuario de cada cambio) | **No cumple** | H20, H54 |
| RNF08 | Contraseñas cifradas | **Parcial** | bcrypt (cost 10) ✔, nunca se devuelve el hash ✔; la contraseña se loguea en texto plano (H04) |
| RNF09 | Expiración de sesión / inactividad de 10 min | **No cumple** | JWT de 1 h, sin logout ni control de inactividad (H24) |
| RNF10 | Política de contraseña robusta | **No cumple** | H28 (además, inconsistencia RNF10 vs RFADMIN01/02) |
| RNF11 | Bloqueo tras 3 intentos fallidos | **No cumple** | H23 |
| Seguridad general (rutas privadas con token) | — | **No cumple** | H01, H02, H03 |

**Totales (37 filas):** Cumple 3 · Parcial 17 · No cumple 17.

---

## 4. Resultado de las pruebas

**Suite:** `backend/tests/` con el runner nativo `node:test` + `fetch` (sin dependencias nuevas). La app se levanta en memoria en un puerto aleatorio.

| Archivo | Cubre |
|---------|-------|
| `tests/helpers.js` | Arranque del servidor, cliente HTTP, fábrica de datos `TEST_`, limpieza, guarda de seguridad (aborta si la base no termina en `_test`) |
| `tests/setup-db.js` | Recrea `cafeterito_test` (DROP + migraciones). Necesario porque las migraciones no son re-ejecutables (H12) |
| `tests/auth.test.js` | RFADMIN01, RFADMIN05, RNF08–RNF11, protección de rutas |
| `tests/users.test.js` | RFADMIN02–05, RNF10, escalada de privilegios |
| `tests/catalog.test.js` | Menú (RFADMIN20–24), inventario (RFADMIN08–11), proveedores (RFADMIN14–17) |
| `tests/orders.test.js` | Órdenes (RFADMIN26–31), RNF02, manejo de errores, 404 |

**Resultado (2026-11-16): 99 pruebas · 30 pasan · 69 fallan · 0 canceladas** (~12 s).

| Grupo | Pasan | Fallan |
|-------|------:|-------:|
| AUTH | 6 | 6 |
| AUTH — protección de rutas | 1 | 7 |
| USUARIOS — camino feliz | 6 | 0 |
| USUARIOS — validaciones | 1 | 16 |
| USUARIOS — reglas de negocio | 0 | 3 |
| MENÚ (products) | 3 | 9 |
| INVENTARIO | 1 | 9 |
| PROVEEDORES | 1 | 7 |
| ÓRDENES | 11 | 7 |
| TRANSVERSALES | 0 | 5 |

Las pruebas describen el comportamiento **requerido**: una falla significa que el requerimiento no se cumple, no que la prueba esté mal. A medida que se corrijan los hallazgos, las pruebas deberían ir pasando sin cambios. **Nota:** hoy `adminToken()` y `createUser()` en `helpers.js` crean los usuarios de prueba por `POST /api/users` sin token (posible solo por H01). Cuando se proteja esa ruta, habrá que cambiar `createUser()` para insertar el admin inicial directamente en la BD (con hash bcrypt) y enviar su token en las demás creaciones.

### Cómo volver a correrlas

```bash
cd backend
npm run test:setup   # recrea la base cafeterito_test y aplica todas las migraciones
npm test             # ejecuta la suite completa
```

- La base de prueba se puede cambiar con `TEST_DB_NAME` (debe terminar en `_test`; si no, la suite aborta).
- `.env` solo aporta las credenciales de PostgreSQL y `JWT_SECRET`/`JWT_EXPIRES`. Su `DB_NAME` **nunca** se usa en las pruebas.
- Cada archivo borra al terminar todo lo que tenga prefijo `TEST_` / `test_` o una mesa ≥ 900.

---

## 5. Endpoints existentes

39 endpoints. "Protegido" = exige `authenticateToken`. "Validación" = validación de entrada en el servidor (Joi: no se usa en ninguno).

| # | Método | Ruta | ¿Protegido? | Validación |
|---|--------|------|-------------|------------|
| 1 | POST | `/api/auth/login` | Público (correcto) | Ninguna |
| 2 | GET | `/api/access/check/:permissionCode` | **Sí** | — |
| 3 | GET | `/api/users` | No | — |
| 4 | GET | `/api/users/report-data?document=` | No | — |
| 5 | GET | `/api/users/:id/permissions` | No | Manual (existencia) |
| 6 | PUT | `/api/users/:id/permissions` | No | Manual (array de ids) |
| 7 | GET | `/api/users/:id` | No | Ninguna (id NaN → 500) |
| 8 | POST | `/api/users` | No | Mínima (contraseña no vacía, ≥ 1 grupo) |
| 9 | PUT | `/api/users/:id` | No | Manual (campos obligatorios, sin formato) |
| 10 | DELETE | `/api/users/:id` | No | — (borrado físico) |
| 11 | GET | `/api/groups` | No | — |
| 12 | GET | `/api/groups/:groupId/permissions` | No | — |
| 13 | PUT | `/api/groups/:groupId/permissions` | No | (fuera de alcance) |
| 14 | GET | `/api/permissions` | No | — |
| 15 | GET | `/api/products` | No | — (no filtra) |
| 16 | GET | `/api/products/top-selling` | No | — (público intencional para el Home) |
| 17 | GET | `/api/products/report-data?category=` | No | — |
| 18 | GET | `/api/products/:id` | No | Ninguna |
| 19 | POST | `/api/products` | No | **Ninguna** |
| 20 | PUT | `/api/products/:id` | No | Manual (nombre, categoría, precio > 0) |
| 21 | DELETE | `/api/products/:id` | No | — (borrado físico) |
| 22 | GET | `/api/inventory` | No | — |
| 23 | GET | `/api/inventory/report-data?category=&status=` | No | — |
| 24 | GET | `/api/inventory/:id` | No | Ninguna |
| 25 | POST | `/api/inventory` | No | **Ninguna** |
| 26 | PUT | `/api/inventory/:id` | No | Manual (obligatorios, números, max ≥ min; estado libre) |
| 27 | DELETE | `/api/inventory/:id` | No | — (borrado físico) |
| 28 | GET | `/api/providers` | No | — |
| 29 | GET | `/api/providers/report-data?nit=` | No | — |
| 30 | GET | `/api/providers/:id` | No | Ninguna |
| 31 | POST | `/api/providers` | No | **Ninguna** |
| 32 | PUT | `/api/providers/:id` | No | Manual (solo texto no vacío) |
| 33 | DELETE | `/api/providers/:id` | No | — (borrado físico) |
| 34 | GET | `/api/orders` | No | — |
| 35 | GET | `/api/orders/report-data?tableNumber=` | No | Manual (entero positivo) |
| 36 | GET | `/api/orders/:id` | No | Ninguna |
| 37 | POST | `/api/orders` | No | **Manual completa** (mesa, ítems, cantidades, disponibilidad, precio desde BD) |
| 38 | PUT | `/api/orders/:id` | No | Manual (estado, ítems; **no valida el estado actual**) |
| 39 | DELETE | `/api/orders/:id` | No | Manual (bloquea solo `pagada`) |

### Lo que está bien (para conservar)

- **SQL 100 % parametrizado** en todos los repositorios revisados (`$1, $2…`, `ANY($1::int[])`, `unnest`); no se encontró concatenación de entrada del usuario. La única interpolación es el nombre de la BD en `migrate.js:46`, que viene de `.env`.
- **bcrypt** (cost 10) al crear usuarios; el hash nunca sale en las respuestas de la API.
- **Órdenes bien diseñadas en creación:** transacción, precio tomado de la BD (ignora el del cliente), cantidades > 0, platillos habilitados, consolidación de ítems repetidos, índice único parcial `uq_orders_active_table` y `unit_price` histórico.
- Transacciones en la creación/edición de usuarios con roles.
- Arquitectura por features clara (routes → controller → service → repository).

---

## 6. Estado tras correcciones

**Rama:** `fix/backend-audit-fixes` · **Fecha:** 2026-11-17 · Un commit por fase (8 fases + un commit inicial con este reporte y la suite).

**Fuera de alcance por decisión del equipo (no implementado):** lógica interna de permisos (`requirePermission` no se aplicó a ninguna ruta; solo se exige token), bitácora/auditoría (RNF02), categorías de menú como tabla y descuento de stock al vender.

Leyenda: **Corregido** · **Parcial** (corregido con salvedades, explicadas) · **Pendiente (fuera de alcance)**.

| ID | Estado | Fase | Qué se hizo / qué falta |
|----|--------|:----:|-------------------------|
| H01 | Corregido | 1 | `authenticateToken` en todos los routers salvo `/api/auth` y `GET /api/products/top-selling`. |
| H02 | Corregido | 1 | `userData` campo por campo; `isSuperuser` = grupo Administrador; `isActive` = true; `isStaff` = false. Joi además descarta los campos desconocidos. |
| H03 | Corregido | 1 | Groups, permissions y los permisos de usuario exigen token. La autorización fina (`requirePermission`) queda fuera de alcance. |
| H04 | Corregido | 1 | Eliminados los `console.log` del body y del usuario con hash (también el log de la nueva contraseña en `ResetPasswordPage` del frontend). |
| H05 | Corregido | 1 | `error.middleware.js`: JSON malformado → 400 en JSON, 5xx genérico, detalle solo en consola. |
| H06 | Corregido | 1, 4 | Códigos PG mapeados a mensajes genéricos; mensajes específicos por `err.constraint` (`withConstraintErrors`). |
| H07 | Corregido | 1 | Handler 404 en JSON. |
| H08 | Corregido | 8 | `CORS_ORIGIN` (lista separada por comas). Frontend: `VITE_API_URL` + `apiClient`, sin URLs hardcodeadas. |
| H09 | Corregido | 7 | `helmet` + `express-rate-limit` en login y recuperación; `x-powered-by` deshabilitado. |
| H10 | Parcial | 1 | `dotenv/config` primero, validación de variables al arrancar, `nodemon` en devDependencies. **Falta (acción manual):** regenerar `JWT_SECRET` con ≥ 64 bytes aleatorios en cada `.env`. |
| H11 | Corregido | 3 | `validate.middleware.js` + un `*.schema.js` por feature, con mensajes en español. |
| H12 | Corregido | 2 | `schema_migrations`, una transacción por archivo, parada en el primer error y modo `--baseline` para bases existentes. |
| H13 | Parcial | 2 | `0028` es re-ejecutable (`ON CONFLICT`). Su `DELETE` de roles se mantuvo (por instrucción) y quedó documentado en `database/README.md`. |
| H14 | Corregido | 4, 8 | `user_address` (10–100) en `0031`; el formulario de alta ya envía la dirección. |
| H15 | Corregido | 4 | `document_type` con CHECK, `nit` NOT NULL + UNIQUE (la migración se detiene si hay nulos o duplicados). |
| H16 | Corregido | 4, 8 | `barcode` único (rellenado `INV-<id>`), `expiration_date`, `provider_id` FK. Formularios de inventario con código de barras y vencimiento. |
| H17 | Parcial | 4 | `price > 0`, `is_available` NOT NULL, nombre único por categoría (sin distinguir mayúsculas). La categoría sigue como texto (tabla de categorías fuera de alcance). |
| H18 | Corregido | 4 | Estados normalizados (`Activo`→`Disponible`, `Averia`→`Avería`) y CHECKs de estado y stock. |
| H19 | Corregido | 4 | Flags NOT NULL con DEFAULT. Los NULL heredados se rellenaron con su valor efectivo (`is_active` NULL → FALSE, porque ya impedía el login). |
| H20 | Pendiente (fuera de alcance) | — | Sin `audit_log` ni `created_by`/`updated_by`. |
| H21 | Corregido | 1 | `npm run seed:admin` (valida RNF10; no duplica). |
| H22 | Parcial | 2 | Nombres raros documentados en `database/README.md`; no se renombraron (no se editan migraciones aplicadas). |
| H23 | Corregido | 7 | 3 intentos fallidos → bloqueo de 15 min y 423; un login correcto reinicia el contador; reactivar al usuario desbloquea. |
| H24 | Parcial | 7, 8 | `JWT_EXPIRES=10m`, `POST /api/auth/refresh` y renovación por actividad en el frontend; cierre a los 10 min de inactividad. **Falta:** logout con revocación del token en el servidor (no se pidió; el logout limpia la sesión del cliente y el token vence en ≤ 10 min). |
| H25 | Corregido | 7, 8 | forgot / verify / reset con código de 6 dígitos (el flujo que ya tenía el frontend): HMAC, 15 min, un solo uso, invalida los anteriores, máx. 5 intentos; respuesta idéntica exista o no el correo. Pantallas del frontend conectadas. |
| H26 | Corregido | 3 | Login con Joi: faltan datos → 400. |
| H27 | Corregido | 7 | El middleware rechaza tokens de usuarios inactivos o bloqueados y valida el esquema `Bearer`. |
| H28 | Corregido | 3, 8 | RNF10 (10–64, mayúscula, minúscula, número, símbolo) en Joi, en `seed-admin` y en los schemas Zod. Se aplicó RNF10 sobre RFADMIN01/02 (8–10). |
| H29 | Corregido | 3 | Formatos de usuario validados (backend y frontend alineados). |
| H30 | Corregido | 3, 4 | Correo `trim().toLowerCase()` al crear, editar y en el login; índice único `lower(user_email)`. |
| H31 | Parcial | 4 | Backend: `user_personal_email` opcional y distinto del empresarial (Joi + CHECK). **Falta:** campo en el formulario del frontend. |
| H32 | Corregido | 5 | Sin `DELETE`; `PATCH /api/users/:id/status`. |
| H33 | Corregido | 8 | Orden alfabético (collation ICU es), `?search&isActive`, paginación opcional. |
| H34 | Corregido | 3 | Grupo inexistente o inactivo → 400 y ROLLBACK; Administrador → `is_superuser` al crear. |
| H35 | Corregido | 3 | `:id` validado (entero positivo) → 400. |
| H36 | Corregido | 3 | Validación completa en el alta de platillos. |
| H37 | Corregido | 4 | Índice único por categoría → 409 con mensaje claro. |
| H38 | Corregido | 5 | `PATCH /api/products/:id/status`; 409 si el platillo está en una orden abierta (RFADMIN24). |
| H39 | Parcial | 8 | Filtros y paginación en el servidor (`?category&search&isAvailable`). Backend de categorías fuera de alcance. |
| H40 | Corregido | 3, 4 | Validación de inventario + lote único por insumo. |
| H41 | Corregido | 4, 8 | Un solo catálogo de estados en BD, backend y frontend. |
| H42 | Pendiente (fuera de alcance) | — | Sin vínculo menú ↔ inventario ni descuento de stock ni alertas de mínimo. |
| H43 | Corregido | 5 | `PATCH /api/inventory/:id/status`. |
| H44 | Corregido | 3, 8 | Tipo de documento sin TI, NIT con dígito de verificación, correo válido (backend y frontend). |
| H45 | Parcial | 4, 5 | Backend: FK `inventory.provider_id` y regla RFADMIN18 (proveedor inactivo → 400). **Falta:** selector de proveedor en el formulario de inventario (la edición conserva el proveedor asignado). |
| H46 | Corregido | 5 | `PATCH /api/providers/:id/status`. |
| H47 | Corregido | 8 | `?search&nit&documentType&isActive`, paginación opcional. |
| H48 | Corregido | 6 | Matriz de transiciones; pagada/cancelada son finales (409), con protección ante cambios concurrentes. |
| H49 | Corregido | 5 | `PATCH /api/orders/:id/cancel` solo para órdenes abiertas; sin `DELETE`. |
| H50 | Corregido | 4, 6, 8 | Estado `lista para entrega` en BD, backend y frontend; cuenta como orden abierta de la mesa. |
| H51 | Corregido | 6 | `waiterId` por defecto = usuario autenticado; si se envía, debe ser un usuario activo. (`created_by`/`updated_by` forman parte de la auditoría, fuera de alcance.) |
| H52 | Corregido | 8 | `?status&tableNumber&from&to`, más recientes primero, paginación opcional. |
| H53 | Corregido | 4, 6 | Mensajes según `err.constraint`; el resto va al middleware global. |
| H54 | Pendiente (fuera de alcance) | — | Bitácora RNF02. |
| H55 | Parcial | 1, 8 | Los endpoints `/report-data` exigen token y el frontend los consume con `apiClient`. **Falta:** permiso `report_*` (fuera de alcance) y filtros por fecha. |
| H56 | Corregido | 1, 3 | `utils/httpError.js`; las validaciones manuales se reemplazaron por Joi. |

**Totales (56):** 44 Corregido · 9 Parcial · 3 Pendiente (fuera de alcance).

### Resultado de las pruebas tras las correcciones

| Momento | Pruebas | Pasan | Fallan |
|---------|--------:|------:|-------:|
| Auditoría inicial | 99 | 30 | 69 |
| Fase 1 — seguridad básica | 99 | 52 | 47 |
| Fase 2 — migraciones | 99 | 52 | 47 |
| Fase 3 — validación Joi | 99 | 70 | 29 |
| Fase 4 — esquema 0031–0037 | 101 | 79 | 22 |
| Fase 5 — sin borrado físico | 110 | 93 | 17 |
| Fase 6 — reglas de órdenes | 112 | 99 | 13 |
| Fase 7 — autenticación | 130 | 121 | 9 |
| **Fase 8 — listados / CORS / frontend** | **135** | **131** | **4** |

Las 4 que siguen fallando corresponden a puntos fuera de alcance: logout con revocación (H24), backend de categorías de menú (H39) y las dos de bitácora RNF02 (H20/H54).

Ajustes de pruebas por **cambios de contrato intencionales** (ninguna aserción se relajó):

- El admin de pruebas se crea directamente en la BD con `seed-admin.js` y las demás peticiones usan su token (las rutas ahora exigen autenticación).
- "Usuario inactivo no puede iniciar sesión": se desactiva con `PATCH /:id/status`, porque el alta ya no acepta `isActive` del cliente (H02).
- Datos de prueba: nombres de usuario solo con letras (regla nueva del nombre) e inventario con `barcode` (ahora obligatorio).
- "Orden pagada/cancelada NO se puede eliminar" → "NO se puede anular (`PATCH /:id/cancel`)", porque ya no existe `DELETE`.
- Se agregaron 36 pruebas nuevas: estados, RFADMIN18/24, transiciones, bloqueo, refresh, recuperación de contraseña, rate limiting, listados y paginación.

Frontend: `npm run build` ✔. `npm run lint`: 11 errores y 3 advertencias, **todos previos a este trabajo** (al empezar eran 12 errores; se corrigió uno: el `Link` sin uso del Home). No se introdujo ningún error nuevo.

```bash
cd backend && npm run test:setup && npm test
```
