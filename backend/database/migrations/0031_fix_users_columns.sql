-- 0031: corrige columnas de users (H14, H19, H30, H31).

-- 1. Flags sin NULL. Se rellenan con su valor EFECTIVO actual: un is_active NULL ya
--    impedía el login (se trataba como inactivo), así que queda FALSE; un admin puede
--    reactivarlo. is_superuser/is_staff NULL se trataban como FALSE.
UPDATE users SET is_active    = FALSE WHERE is_active    IS NULL;
UPDATE users SET is_superuser = FALSE WHERE is_superuser IS NULL;
UPDATE users SET is_staff     = FALSE WHERE is_staff     IS NULL;

ALTER TABLE users
    ALTER COLUMN is_active    SET DEFAULT TRUE,
    ALTER COLUMN is_active    SET NOT NULL,
    ALTER COLUMN is_superuser SET DEFAULT FALSE,
    ALTER COLUMN is_superuser SET NOT NULL,
    ALTER COLUMN is_staff     SET DEFAULT FALSE,
    ALTER COLUMN is_staff     SET NOT NULL;

-- 2. Dirección (eliminada en 0002). Nullable para los registros existentes.
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_address VARCHAR(100);
ALTER TABLE users ADD CONSTRAINT chk_users_address_length
    CHECK (user_address IS NULL OR char_length(user_address) BETWEEN 10 AND 100);

-- 3. Correo personal (opcional) distinto del empresarial.
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_personal_email VARCHAR(150);

-- 4. Correo único sin distinguir mayúsculas. Si al normalizar quedan duplicados,
--    la migración se DETIENE (no se borra ni modifica nada).
DO $$
DECLARE dups TEXT;
BEGIN
    SELECT string_agg(email, ', ') INTO dups
    FROM (SELECT lower(trim(user_email)) AS email
          FROM users GROUP BY 1 HAVING count(*) > 1) d;
    IF dups IS NOT NULL THEN
        RAISE EXCEPTION '0031: hay correos duplicados al normalizar a minúsculas: %. Resuélvelos manualmente y vuelve a ejecutar npm run migrate.', dups;
    END IF;
END $$;

UPDATE users SET user_email = lower(trim(user_email))
WHERE user_email <> lower(trim(user_email));

UPDATE users SET user_personal_email = lower(trim(user_personal_email))
WHERE user_personal_email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (lower(user_email));

ALTER TABLE users ADD CONSTRAINT chk_users_personal_email_distinct
    CHECK (user_personal_email IS NULL OR lower(user_personal_email) <> lower(user_email));
