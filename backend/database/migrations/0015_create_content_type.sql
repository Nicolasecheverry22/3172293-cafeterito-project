-- Tabla content_type: identifica el feature (app_label) y la entidad (model) de cada permiso
CREATE TABLE content_type (
    content_type_id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,

    -- Evita valores duplicados en la combinacion feature/entidad
    CONSTRAINT uq_content_type
        UNIQUE (app_label, model)
);
