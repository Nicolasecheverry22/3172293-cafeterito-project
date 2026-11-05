-- Agrega los módulos Productos e Inventario a la tabla content_type (idempotente)
INSERT INTO content_type (app_label, model, display_name)
VALUES
    ('products', 'product', 'Productos'),
    ('inventory', 'inventory', 'Inventario')
ON CONFLICT (app_label, model) DO NOTHING;
