-- Registros iniciales de content_type (idempotente)
INSERT INTO content_type (app_label, model)
VALUES
    ('users', 'user'),
    ('groups', 'group'),
    ('tasks', 'task'),
    ('access', 'permission')
ON CONFLICT (app_label, model) DO NOTHING;
