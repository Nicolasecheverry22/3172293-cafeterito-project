-- 0042: catálogo completo de permisos por módulo y matriz por defecto de los roles base.
-- Idempotente: se puede ejecutar varias veces.
--
-- ATENCIÓN (paso 4): REINICIA los permisos de los grupos Administrador, Mesero, Cocinero,
-- Caja e Invitado. Lo que se haya asignado a mano a esos grupos desde "Gestión de Permisos"
-- se reemplaza por la matriz de abajo. Los permisos directos de usuarios (user_permissions)
-- y los de otros grupos NO se tocan.

-- ── 1. Módulos (content_type) ───────────────────────────────────────────────
INSERT INTO content_type (app_label, model, display_name)
VALUES
    ('users',     'user',       'Usuarios'),
    ('products',  'product',    'Menú'),
    ('inventory', 'inventory',  'Inventario'),
    ('providers', 'provider',   'Proveedores'),
    ('orders',    'order',      'Órdenes'),
    ('invoices',  'invoice',    'Comprobantes de venta'),
    ('security',  'permission', 'Seguridad')
ON CONFLICT (app_label, model) DO NOTHING;

-- En la interfaz el módulo de productos se llama "Menú"
UPDATE content_type SET display_name = 'Menú'
WHERE app_label = 'products' AND model = 'product' AND display_name IS DISTINCT FROM 'Menú';

-- ── 2. Catálogo (codename → nombre en español y módulo) ─────────────────────
CREATE TEMP TABLE IF NOT EXISTS tmp_permission_catalog (
    app_label VARCHAR(100), model VARCHAR(100), codename VARCHAR(100), name VARCHAR(150)
);
TRUNCATE tmp_permission_catalog;
INSERT INTO tmp_permission_catalog (app_label, model, codename, name) VALUES
    ('users',     'user',       'list_user',               'Listar usuarios'),
    ('users',     'user',       'view_user',               'Visualizar usuarios'),
    ('users',     'user',       'create_user',             'Crear usuarios'),
    ('users',     'user',       'update_user',             'Actualizar usuarios'),
    ('users',     'user',       'disable_user',            'Activar/Desactivar usuarios'),
    ('users',     'user',       'report_user',             'Generar reporte usuarios'),
    ('products',  'product',    'list_product',            'Listar productos'),
    ('products',  'product',    'view_product',            'Visualizar productos'),
    ('products',  'product',    'create_product',          'Crear productos'),
    ('products',  'product',    'update_product',          'Actualizar productos'),
    ('products',  'product',    'disable_product',         'Habilitar/Inhabilitar productos'),
    ('products',  'product',    'report_product',          'Generar reporte de productos'),
    ('inventory', 'inventory',  'list_inventory',          'Listar inventario'),
    ('inventory', 'inventory',  'view_inventory',          'Visualizar inventario'),
    ('inventory', 'inventory',  'create_inventory',        'Crear inventario'),
    ('inventory', 'inventory',  'update_inventory',        'Actualizar inventario'),
    ('inventory', 'inventory',  'change_status_inventory', 'Cambiar estado del inventario'),
    ('inventory', 'inventory',  'report_inventory',        'Generar reporte de inventario'),
    ('providers', 'provider',   'list_provider',           'Listar proveedores'),
    ('providers', 'provider',   'view_provider',           'Visualizar proveedores'),
    ('providers', 'provider',   'create_provider',         'Crear proveedores'),
    ('providers', 'provider',   'update_provider',         'Actualizar proveedores'),
    ('providers', 'provider',   'disable_provider',        'Habilitar/Inhabilitar proveedores'),
    ('providers', 'provider',   'report_provider',         'Generar reporte de proveedores'),
    ('orders',    'order',      'list_order',              'Listar órdenes'),
    ('orders',    'order',      'view_order',              'Visualizar órdenes'),
    ('orders',    'order',      'create_order',            'Crear órdenes'),
    ('orders',    'order',      'update_order',            'Actualizar órdenes'),
    ('orders',    'order',      'prepare_order',           'Marcar órdenes listas para entrega'),
    ('orders',    'order',      'cancel_order',            'Anular órdenes'),
    ('orders',    'order',      'report_order',            'Generar reporte de órdenes'),
    ('invoices',  'invoice',    'create_invoice',          'Generar comprobantes de venta'),
    ('invoices',  'invoice',    'list_invoice',            'Listar comprobantes de venta'),
    ('invoices',  'invoice',    'view_invoice',            'Visualizar comprobantes de venta'),
    ('invoices',  'invoice',    'void_invoice',            'Anular comprobantes de venta'),
    ('invoices',  'invoice',    'report_invoice',          'Generar reporte de comprobantes'),
    ('settings',  'restaurant_settings', 'change_settings', 'Modificar configuración'),
    ('security',  'permission', 'manage_permissions',      'Gestionar roles y permisos');

-- ── 3. Renombra los permisos obsoletos conservando sus asignaciones ─────────
CREATE TEMP TABLE IF NOT EXISTS tmp_permission_renames (old_code VARCHAR(100), new_code VARCHAR(100));
TRUNCATE tmp_permission_renames;
INSERT INTO tmp_permission_renames (old_code, new_code) VALUES
    ('delete_product',   'disable_product'),
    ('delete_provider',  'disable_provider'),
    ('delete_inventory', 'change_status_inventory'),
    ('delete_order',     'cancel_order');

-- 3a. Caso normal: el código nuevo aún no existe → UPDATE (mismo permission_id)
UPDATE permissions p
SET permission_codename = r.new_code,
    permission_name     = c.name,
    updated_at          = NOW()
FROM tmp_permission_renames r
JOIN tmp_permission_catalog c ON c.codename = r.new_code
WHERE p.permission_codename = r.old_code
  AND NOT EXISTS (SELECT 1 FROM permissions x WHERE x.permission_codename = r.new_code);

-- 3b. Si ya existían ambos: se pasan las asignaciones al nuevo y se borra el viejo
INSERT INTO user_permissions (user_id, permission_id)
SELECT up.user_id, pn.permission_id
FROM tmp_permission_renames r
JOIN permissions po ON po.permission_codename = r.old_code
JOIN permissions pn ON pn.permission_codename = r.new_code
JOIN user_permissions up ON up.permission_id = po.permission_id
ON CONFLICT (user_id, permission_id) DO NOTHING;

INSERT INTO group_permissions (group_id, permission_id)
SELECT gp.group_id, pn.permission_id
FROM tmp_permission_renames r
JOIN permissions po ON po.permission_codename = r.old_code
JOIN permissions pn ON pn.permission_codename = r.new_code
JOIN group_permissions gp ON gp.permission_id = po.permission_id
ON CONFLICT (group_id, permission_id) DO NOTHING;

DELETE FROM permissions
WHERE permission_codename IN (SELECT old_code FROM tmp_permission_renames);

-- ── 4. Completa el catálogo ──────────────────────────────────────────────────
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT c.name, c.codename, ct.content_type_id
FROM tmp_permission_catalog c
JOIN content_type ct ON ct.app_label = c.app_label AND ct.model = c.model
ON CONFLICT (permission_codename) DO NOTHING;

-- ── 5. Matriz por defecto: REINICIA los permisos de los 5 grupos base ───────
DELETE FROM group_permissions
WHERE group_id IN (
    SELECT group_id FROM groups
    WHERE group_name IN ('Administrador', 'Mesero', 'Cocinero', 'Caja', 'Invitado')
);

-- Administrador: todos los permisos del sistema
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g CROSS JOIN permissions p
WHERE g.group_name = 'Administrador'
ON CONFLICT (group_id, permission_id) DO NOTHING;

-- Mesero, Cocinero y Caja (Invitado: ninguno)
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM (VALUES
    ('Mesero',   'list_product'), ('Mesero',   'view_product'),
    ('Mesero',   'list_order'),   ('Mesero',   'view_order'),
    ('Mesero',   'create_order'), ('Mesero',   'update_order'),

    ('Cocinero', 'list_order'),   ('Cocinero', 'view_order'),   ('Cocinero', 'prepare_order'),
    ('Cocinero', 'list_product'), ('Cocinero', 'view_product'),
    ('Cocinero', 'list_inventory'), ('Cocinero', 'view_inventory'),

    ('Caja',     'list_order'),   ('Caja',     'view_order'),
    ('Caja',     'list_product'), ('Caja',     'view_product'),
    ('Caja',     'create_invoice'), ('Caja',   'list_invoice'),
    ('Caja',     'view_invoice'),   ('Caja',   'report_invoice')
) AS m(group_name, codename)
JOIN groups g      ON g.group_name = m.group_name
JOIN permissions p ON p.permission_codename = m.codename
ON CONFLICT (group_id, permission_id) DO NOTHING;

DROP TABLE IF EXISTS tmp_permission_renames;
DROP TABLE IF EXISTS tmp_permission_catalog;
