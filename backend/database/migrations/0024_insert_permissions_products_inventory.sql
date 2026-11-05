
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Listar productos',     'list_product',   (SELECT content_type_id FROM content_type WHERE app_label = 'products')),
    ('Crear productos',      'create_product', (SELECT content_type_id FROM content_type WHERE app_label = 'products')),
    ('Actualizar productos', 'update_product', (SELECT content_type_id FROM content_type WHERE app_label = 'products')),
    ('Eliminar productos',   'delete_product', (SELECT content_type_id FROM content_type WHERE app_label = 'products'));


INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Listar inventario',     'list_inventory',   (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Crear inventario',      'create_inventory', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Actualizar inventario', 'update_inventory', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Eliminar inventario',   'delete_inventory', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory'));
