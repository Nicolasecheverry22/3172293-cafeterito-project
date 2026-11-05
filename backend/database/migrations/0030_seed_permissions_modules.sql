-- Catálogo de permisos por módulo para la pantalla "Gestión de Permisos". Idempotente.

-- 1. Módulos que faltaban en content_type.
INSERT INTO content_type (app_label, model, display_name)
VALUES
    ('providers', 'provider', 'Proveedores'),
    ('orders',    'order',    'Órdenes')
ON CONFLICT (app_label, model) DO NOTHING;

-- 2. Usuarios: completa el CRUD (list_user y create_user ya existen).
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.name, v.codename, ct.content_type_id
FROM (VALUES
    ('Visualizar usuarios',         'view_user'),
    ('Actualizar usuarios',         'update_user'),
    ('Activar/Desactivar usuarios', 'disable_user'),
    ('Generar reporte usuarios',    'report_user')
) AS v(name, codename)
JOIN content_type ct ON ct.app_label = 'users' AND ct.model = 'user'
ON CONFLICT (permission_codename) DO NOTHING;

-- 3. Proveedores.
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.name, v.codename, ct.content_type_id
FROM (VALUES
    ('Listar proveedores',     'list_provider'),
    ('Crear proveedores',      'create_provider'),
    ('Actualizar proveedores', 'update_provider'),
    ('Eliminar proveedores',   'delete_provider')
) AS v(name, codename)
JOIN content_type ct ON ct.app_label = 'providers'
ON CONFLICT (permission_codename) DO NOTHING;

-- 4. Órdenes.
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.name, v.codename, ct.content_type_id
FROM (VALUES
    ('Listar órdenes',     'list_order'),
    ('Crear órdenes',      'create_order'),
    ('Actualizar órdenes', 'update_order'),
    ('Eliminar órdenes',   'delete_order')
) AS v(name, codename)
JOIN content_type ct ON ct.app_label = 'orders'
ON CONFLICT (permission_codename) DO NOTHING;

-- 5. Corrección: 0019 creó 'list_order' apuntando al módulo Usuarios (content_type_id = 1).
UPDATE permissions
SET permission_name = 'Listar órdenes',
    content_type_id = (SELECT content_type_id FROM content_type WHERE app_label = 'orders'),
    updated_at = NOW()
WHERE permission_codename = 'list_order'
  AND content_type_id IS DISTINCT FROM (SELECT content_type_id FROM content_type WHERE app_label = 'orders');
