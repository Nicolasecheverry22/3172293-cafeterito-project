-- Nombre amigable para mostrar los modulos en la interfaz (idempotente)
ALTER TABLE content_type
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) NOT NULL DEFAULT '';
