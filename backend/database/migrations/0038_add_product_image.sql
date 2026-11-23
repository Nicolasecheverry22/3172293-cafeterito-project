-- 0038: imagen del platillo almacenada en la BD (data URL base64).
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_image TEXT;
