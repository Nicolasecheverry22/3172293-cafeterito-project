-- 0034: tipo de documento y NIT obligatorio y único en providers (H15).
-- Si hay proveedores sin NIT o con NIT repetido, la migración se DETIENE.
DO $$
DECLARE missing INT; dups TEXT;
BEGIN
    SELECT count(*) INTO missing FROM providers WHERE nit IS NULL OR trim(nit) = '';
    IF missing > 0 THEN
        RAISE EXCEPTION '0034: hay % proveedor(es) sin NIT/documento. Complétalos y vuelve a ejecutar npm run migrate.', missing;
    END IF;

    SELECT string_agg(nit, ', ') INTO dups
    FROM (SELECT trim(nit) AS nit FROM providers GROUP BY 1 HAVING count(*) > 1) d;
    IF dups IS NOT NULL THEN
        RAISE EXCEPTION '0034: hay NIT duplicados en providers: %. Resuélvelos y vuelve a ejecutar npm run migrate.', dups;
    END IF;
END $$;

UPDATE providers SET nit = trim(nit) WHERE nit <> trim(nit);

ALTER TABLE providers ADD COLUMN IF NOT EXISTS document_type VARCHAR(10) NOT NULL DEFAULT 'NIT';
ALTER TABLE providers ADD CONSTRAINT chk_providers_document_type
    CHECK (document_type IN ('NIT', 'CC', 'CE', 'PEP', 'PPT'));

ALTER TABLE providers ALTER COLUMN nit SET NOT NULL;
ALTER TABLE providers ADD CONSTRAINT uq_providers_nit UNIQUE (nit);

UPDATE providers SET is_active = TRUE WHERE is_active IS NULL;
ALTER TABLE providers
    ALTER COLUMN is_active SET DEFAULT TRUE,
    ALTER COLUMN is_active SET NOT NULL;
