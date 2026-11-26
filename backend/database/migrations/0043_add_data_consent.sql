-- 0043: evidencia de la autorización de tratamiento de datos personales (Ley 1581 de 2012,
-- art. 9: la autorización debe poder consultarse posteriormente).
-- Política aceptada: Acuerdo SENA 0013 de 2019, "Política General de Seguridad de la
-- Información y Protección de Datos Personales en el SENA".
-- Los usuarios existentes quedan en NULL ("Sin registro de autorización").
-- Idempotente: se puede ejecutar varias veces.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS data_consent_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS data_policy_url VARCHAR(255) NULL;

COMMENT ON COLUMN users.data_consent_at IS 'Fecha y hora en que el titular autorizó el tratamiento de sus datos (Ley 1581 de 2012)';
COMMENT ON COLUMN users.data_policy_url IS 'URL de la política de tratamiento de datos aceptada';
