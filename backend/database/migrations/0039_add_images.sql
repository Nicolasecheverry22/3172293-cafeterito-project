-- 0039: imágenes (data URL base64) y miniaturas 96×96 de usuarios, insumos,
-- proveedores y platillos. Los listados leen solo la miniatura (*_thumb);
-- la imagen completa se lee únicamente en el detalle (getById).
-- Idempotente: se puede ejecutar más de una vez.

ALTER TABLE users     ADD COLUMN IF NOT EXISTS user_image            TEXT;
ALTER TABLE users     ADD COLUMN IF NOT EXISTS user_image_thumb      TEXT;

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS provision_image       TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS provision_image_thumb TEXT;

ALTER TABLE providers ADD COLUMN IF NOT EXISTS provider_image        TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS provider_image_thumb  TEXT;

-- products.product_image ya existe (0038)
ALTER TABLE products  ADD COLUMN IF NOT EXISTS product_image_thumb   TEXT;
