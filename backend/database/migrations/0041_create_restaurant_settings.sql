-- 0041: configuración del restaurante editable por el administrador.
-- Tabla de UNA sola fila (id fijo = TRUE): cada ajuste es una columna tipada con su CHECK,
-- en vez de un clave/valor en texto. Un ajuste nuevo = una columna nueva en otra migración.

CREATE TABLE IF NOT EXISTS restaurant_settings (
    id          BOOLEAN     PRIMARY KEY DEFAULT TRUE,
    table_count SMALLINT    NOT NULL DEFAULT 12,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by  INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_restaurant_settings_single_row CHECK (id),
    CONSTRAINT chk_restaurant_settings_table_count CHECK (table_count BETWEEN 1 AND 200)
);

INSERT INTO restaurant_settings (id) VALUES (TRUE) ON CONFLICT (id) DO NOTHING;

-- Permiso para modificarla (el superusuario lo tiene implícito)
INSERT INTO content_type (app_label, model, display_name)
VALUES ('settings', 'restaurant_settings', 'Configuración')
ON CONFLICT (app_label, model) DO NOTHING;

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT 'Modificar configuración', 'change_settings', ct.content_type_id
FROM content_type ct
WHERE ct.app_label = 'settings' AND ct.model = 'restaurant_settings'
ON CONFLICT (permission_codename) DO NOTHING;