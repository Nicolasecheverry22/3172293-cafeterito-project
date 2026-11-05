
DELETE FROM groups
WHERE group_name IN ('Instructor', 'Aprendiz');


INSERT INTO groups (group_name, is_active)
VALUES
    ('Cocinero', true),
    ('Mesero',   true),
    ('Caja',     true),
    ('Invitado', true)
ON CONFLICT (group_name) DO NOTHING;
