-- 0035: estados, reglas de stock, código de barras, vencimiento y proveedor en inventory
-- (H16, H18, RFADMIN08). Si hay datos que violan las nuevas reglas, la migración se DETIENE.

-- 1. Normaliza los estados heredados de los seeds al catálogo del requerimiento.
UPDATE inventory SET status = 'Disponible' WHERE status IN ('Activo', 'Disponible') OR status IS NULL;
UPDATE inventory SET status = 'Avería'     WHERE status = 'Averia';

UPDATE inventory SET stock     = 0 WHERE stock     IS NULL;
UPDATE inventory SET min_stock = 0 WHERE min_stock IS NULL;
UPDATE inventory SET max_stock = min_stock WHERE max_stock IS NULL;

DO $$
DECLARE bad TEXT;
BEGIN
    SELECT string_agg(DISTINCT status, ', ') INTO bad
    FROM inventory WHERE status NOT IN ('Disponible', 'Vencido', 'Avería', 'Agotado');
    IF bad IS NOT NULL THEN
        RAISE EXCEPTION '0035: estados de inventario no reconocidos: %. Corrígelos y vuelve a ejecutar npm run migrate.', bad;
    END IF;

    SELECT string_agg(id::text, ', ') INTO bad
    FROM inventory WHERE stock < 0 OR min_stock < 0 OR max_stock < min_stock;
    IF bad IS NOT NULL THEN
        RAISE EXCEPTION '0035: insumos con stock negativo o máximo < mínimo (ids: %). Corrígelos y vuelve a ejecutar npm run migrate.', bad;
    END IF;

    SELECT string_agg(provision_name || ' / ' || batch, ', ') INTO bad
    FROM (SELECT min(provision_name) AS provision_name, batch FROM inventory
          WHERE batch IS NOT NULL
          GROUP BY lower(provision_name), batch HAVING count(*) > 1) d;
    IF bad IS NOT NULL THEN
        RAISE EXCEPTION '0035: lotes repetidos para el mismo insumo: %. Corrígelos y vuelve a ejecutar npm run migrate.', bad;
    END IF;
END $$;

ALTER TABLE inventory
    ALTER COLUMN status    SET DEFAULT 'Disponible',
    ALTER COLUMN status    SET NOT NULL,
    ALTER COLUMN stock     SET NOT NULL,
    ALTER COLUMN min_stock SET NOT NULL,
    ALTER COLUMN max_stock SET NOT NULL;

ALTER TABLE inventory ADD CONSTRAINT chk_inventory_status
    CHECK (status IN ('Disponible', 'Vencido', 'Avería', 'Agotado'));
ALTER TABLE inventory ADD CONSTRAINT chk_inventory_stock     CHECK (stock >= 0);
ALTER TABLE inventory ADD CONSTRAINT chk_inventory_min_stock CHECK (min_stock >= 0);
ALTER TABLE inventory ADD CONSTRAINT chk_inventory_max_stock CHECK (max_stock >= min_stock);

-- Un mismo lote no se registra dos veces para el mismo insumo
CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_name_batch ON inventory (lower(provision_name), batch);

-- 2. Código de barras único. Los registros existentes reciben un código generado.
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);
UPDATE inventory SET barcode = 'INV-' || id WHERE barcode IS NULL;
ALTER TABLE inventory ALTER COLUMN barcode SET NOT NULL;
ALTER TABLE inventory ADD CONSTRAINT uq_inventory_barcode UNIQUE (barcode);

-- 3. Fecha de vencimiento (necesaria para el estado "Vencido").
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- 4. Proveedor del insumo (RFADMIN15/18).
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS provider_id INTEGER;
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_provider
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_inventory_provider_id ON inventory(provider_id);
