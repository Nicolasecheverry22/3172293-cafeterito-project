-- Agrega estado activo/inactivo a los grupos (idempotente)
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
