# Base de datos y migraciones

## Comandos

| Comando | Qué hace |
|---------|----------|
| `npm run migrate` | Crea la base `DB_NAME` si no existe y aplica las migraciones **pendientes**, en orden, cada una en su propia transacción. Se detiene en el primer error indicando el archivo. |
| `npm run migrate -- --baseline` | Para bases creadas **antes** de que existiera `schema_migrations`: registra como aplicadas, **sin ejecutarlas**, las migraciones cuyos objetos ya existen. |
| `npm run seed:admin` | Crea el administrador inicial con `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NAME` de `.env`. Si ya existe un usuario con ese correo, no hace nada. |
| `npm run test:setup` | Recrea desde cero la base de **pruebas** (`cafeterito_test`). Nunca toca la base de `.env`. |

## Cómo funciona el registro

La tabla `schema_migrations(filename PRIMARY KEY, applied_at TIMESTAMPTZ)` guarda qué archivos ya se aplicaron. `npm run migrate` solo ejecuta los que no están en esa tabla, así que se puede correr cuantas veces se quiera.

Antes, el runner ejecutaba **todas** las migraciones en cada corrida. Como `0028` no era idempotente, la segunda ejecución fallaba y las migraciones posteriores (`0029`, `0030`, …) nunca llegaban a aplicarse en las bases del equipo.

## Procedimiento para una base existente del equipo

Aplica si tu base se creó con el runner anterior. Si corres `npm run migrate`, verás: *"ya tiene tablas pero ninguna migración registrada"*.

1. **Respalda la base** (recomendado):
   ```bash
   pg_dump -U <usuario> -d <base> -F c -f respaldo_antes_baseline.dump
   ```
2. Registra lo que ya está aplicado:
   ```bash
   npm run migrate -- --baseline
   ```
   La salida lista dos grupos: ✔ las migraciones registradas (detectadas por la existencia de sus tablas, columnas, constraints o datos semilla) y • las **pendientes**. Es normal que `0029`/`0030` aparezcan como pendientes en bases afectadas por el fallo de `0028`.
3. Aplica las pendientes:
   ```bash
   npm run migrate
   ```
4. Si es una base nueva sin usuarios, crea el administrador:
   ```bash
   npm run seed:admin
   ```

Los detectores están en `database/migration-detectors.js`. Si un detector no puede evaluarse (por ejemplo, porque la tabla no existe), la migración se considera **no aplicada** y se ejecutará en el paso 3. Todas las migraciones semilla usan `ON CONFLICT`, por lo que ejecutarlas de nuevo no duplica datos.

## Reglas para escribir migraciones

- **No edites migraciones ya aplicadas.** Crea un archivo nuevo con el siguiente número (`0038_...sql`).
- Cada archivo se ejecuta dentro de `BEGIN/COMMIT`: no uses comandos que no se puedan ejecutar en una transacción (`CREATE INDEX CONCURRENTLY`, `VACUUM`, `CREATE DATABASE`).
- Agrega el detector de la nueva migración en `migration-detectors.js`.
- Prefiere SQL idempotente (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).
- Antes de agregar `UNIQUE` o `NOT NULL` sobre datos existentes, la migración debe detectar duplicados o nulos y abortar con un mensaje claro (`RAISE EXCEPTION`), en lugar de borrar o modificar datos en silencio.

## Advertencias sobre migraciones antiguas

| Migración | Advertencia |
|-----------|-------------|
| `0002_edit_column_and_delete_data_table.sql` | Renombra `password` → `user_password` y **elimina** las columnas `user_address` y `user_lastname` (con sus datos). `0031` vuelve a agregar `user_address`. |
| `0028_update_groups_roles.sql` | **Borra los roles `Instructor` y `Aprendiz`.** Por el `ON DELETE CASCADE` de `user_groups`, los usuarios que los tenían **pierden ese rol** sin aviso. Es la única migración antigua que se editó, solo para agregar `ON CONFLICT (group_name) DO NOTHING` al `INSERT`; el `DELETE` se mantuvo para no cambiar el resultado donde ya corrió. |
| `0008_create_user_permission.sql` | Pese al nombre, inserta permisos (no crea tablas). |
| `0010_insert_grop_permissions.sql` | Errata en el nombre ("grop"). |
| `0019_new_permission.sql` | Creó `list_order` en el módulo Usuarios; lo corrige `0030`. |
| `schemas/users/users.sql` | Archivo de referencia; el runner **no** lo ejecuta. |
