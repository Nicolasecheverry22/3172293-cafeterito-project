-- Agrega estado activo/inactivo a los grupos (necesario para administrarlos desde la UI)
ALTER TABLE groups
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
