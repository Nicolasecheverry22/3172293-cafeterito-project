-- 0036: reglas de products (platillos del menú) (H17, H37, RFADMIN20).
-- Si hay precios <= 0 o nombres repetidos en la misma categoría, la migración se DETIENE.

UPDATE products SET is_available = TRUE WHERE is_available IS NULL;
ALTER TABLE products
    ALTER COLUMN is_available SET DEFAULT TRUE,
    ALTER COLUMN is_available SET NOT NULL;

DO $$
DECLARE bad TEXT;
BEGIN
    SELECT string_agg(id::text, ', ') INTO bad FROM products WHERE price <= 0;
    IF bad IS NOT NULL THEN
        RAISE EXCEPTION '0036: platillos con precio <= 0 (ids: %). Corrígelos y vuelve a ejecutar npm run migrate.', bad;
    END IF;

    SELECT string_agg(category || ' / ' || product_name, ', ') INTO bad
    FROM (SELECT min(category) AS category, min(product_name) AS product_name
          FROM products
          GROUP BY lower(category), lower(product_name) HAVING count(*) > 1) d;
    IF bad IS NOT NULL THEN
        RAISE EXCEPTION '0036: platillos repetidos en la misma categoría: %. Corrígelos y vuelve a ejecutar npm run migrate.', bad;
    END IF;
END $$;

ALTER TABLE products ADD CONSTRAINT chk_products_price CHECK (price > 0);

-- Nombre único por categoría, sin distinguir mayúsculas
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_category_name
    ON products (lower(category), lower(product_name));
