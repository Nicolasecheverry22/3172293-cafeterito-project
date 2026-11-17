// Detectores para "npm run migrate -- --baseline".
//
// Cada entrada es una expresión SQL booleana que devuelve TRUE si los objetos o datos
// que crea esa migración ya existen en la base. Se evalúa como SELECT (<expresión>).
// Si la expresión falla (p. ej. la tabla no existe todavía), se considera NO aplicada.
//
// Al crear una migración nueva, agrega aquí su detector.

const table = (name) => `to_regclass('public.${name}') IS NOT NULL`;
const column = (tbl, col) =>
  `EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = '${tbl}' AND column_name = '${col}')`;
const constraint = (name) =>
  `EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${name}')`;
const index = (name) =>
  `EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = '${name}')`;

export const DETECTORS = {
  "0001_create_users_table.sql": table("users"),
  "0002_edit_column_and_delete_data_table.sql": `${column("users", "user_password")} AND NOT ${column("users", "password")}`,
  "0003_create_permission.sql": table("permissions"),
  "0004_create_groups.sql": table("groups"),
  "0005_create_group_permissions.sql": table("group_permissions"),
  "0006_create_user_groups.sql": table("user_groups"),
  "0007_create_user_permissions.sql": table("user_permissions"),
  "0008_create_user_permission.sql": `EXISTS (SELECT 1 FROM permissions WHERE permission_codename = 'list_user')`,
  "0009_insert_group.sql": `EXISTS (SELECT 1 FROM groups WHERE group_name = 'Administrador')`,
  "0010_insert_grop_permissions.sql": `EXISTS (
      SELECT 1 FROM group_permissions gp
      JOIN groups g ON g.group_id = gp.group_id
      JOIN permissions p ON p.permission_id = gp.permission_id
      WHERE g.group_name = 'Administrador' AND p.permission_codename = 'list_user')`,
  "0011_add_is_active_to_groups.sql": column("groups", "is_active"),
  "0012_create_content_type.sql": table("content_type"),
  "0013_seed_content_type.sql": `EXISTS (SELECT 1 FROM content_type WHERE app_label = 'users' AND model = 'user')`,
  "0014_add_fk_permissions_content_type.sql": constraint("fk_permissions_content_type"),
  "0015_update_permissions_content_type.sql": `EXISTS (SELECT 1 FROM permissions WHERE permission_codename = 'list_user' AND content_type_id IS NOT NULL)`,
  "0016_add_display_name_to_content_type.sql": column("content_type", "display_name"),
  "0017_update_content_type_display_name.sql": `EXISTS (SELECT 1 FROM content_type WHERE app_label = 'users' AND display_name = 'Usuarios')`,
  // 0028 borra 'Instructor'/'Aprendiz'; si ya existe 'Cocinero' (0028), 0018 corrió antes.
  "0018_new_groups.sql": `EXISTS (SELECT 1 FROM groups WHERE group_name IN ('Instructor', 'Cocinero'))`,
  "0019_new_permission.sql": `EXISTS (SELECT 1 FROM permissions WHERE permission_codename = 'list_order')`,
  "0020_create_content_type_products_inventory.sql": `EXISTS (SELECT 1 FROM content_type WHERE app_label = 'products')`,
  "0021_insert_permissions_products_inventory.sql": `EXISTS (SELECT 1 FROM permissions WHERE permission_codename = 'list_inventory')`,
  "0022_create_products_table.sql": table("products"),
  "0023_create_inventory_table.sql": table("inventory"),
  // Seeds: se consideran aplicados si la tabla tiene datos (evita re-sembrar filas borradas)
  "0024_seed_products.sql": `EXISTS (SELECT 1 FROM products)`,
  "0025_seed_inventory.sql": `EXISTS (SELECT 1 FROM inventory)`,
  "0026_create_providers_table.sql": table("providers"),
  "0027_seed_providers.sql": `EXISTS (SELECT 1 FROM providers)`,
  "0028_update_groups_roles.sql": `EXISTS (SELECT 1 FROM groups WHERE group_name = 'Cocinero')`,
  "0029_create_orders_tables.sql": `${table("orders")} AND ${table("order_items")} AND ${index("uq_orders_active_table")}`,
  "0030_seed_permissions_modules.sql": `EXISTS (SELECT 1 FROM content_type WHERE app_label = 'providers')
      AND EXISTS (SELECT 1 FROM permissions WHERE permission_codename = 'delete_order')`,
};
