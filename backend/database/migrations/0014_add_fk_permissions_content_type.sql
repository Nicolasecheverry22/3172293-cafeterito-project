-- Relaciona cada permiso con su content_type (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_permissions_content_type'
      AND table_name = 'permissions'
  ) THEN
    ALTER TABLE permissions
    ADD CONSTRAINT fk_permissions_content_type
        FOREIGN KEY (content_type_id)
        REFERENCES content_type(content_type_id);
  END IF;
END $$;
