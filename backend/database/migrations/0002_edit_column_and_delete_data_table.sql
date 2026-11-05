-- Idempotente: renombra/elimina columnas solo si corresponde.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users RENAME COLUMN password TO user_password;
  END IF;
END $$;

ALTER TABLE users DROP COLUMN IF EXISTS user_address;
ALTER TABLE users DROP COLUMN IF EXISTS user_lastname;
