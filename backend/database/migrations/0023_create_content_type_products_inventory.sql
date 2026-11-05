-- Agrega los módulos Productos e Inventario a la tabla content_type
INSERT INTO content_type (app_label, model, display_name)
VALUES
    ('products', 'product', 'Productos'),
    ('inventory', 'inventory', 'Inventario');
