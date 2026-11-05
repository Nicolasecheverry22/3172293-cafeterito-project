-- Registros iniciales de content_type
INSERT INTO content_type (
    app_label,
    model
)
VALUES
    ('users', 'user'),
    ('groups', 'group'),
    ('tasks', 'task'),
    ('access', 'permission');
