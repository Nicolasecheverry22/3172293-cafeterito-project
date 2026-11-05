INSERT INTO groups (group_name, is_active)
VALUES
    ('Instructor', true),
    ('Aprendiz', true)
ON CONFLICT (group_name) DO NOTHING;
