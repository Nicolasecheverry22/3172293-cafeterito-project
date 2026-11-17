-- ATENCIÓN: este DELETE elimina los roles 'Instructor' y 'Aprendiz'. Por el
-- ON DELETE CASCADE de user_groups, los usuarios que los tenían quedan sin ese rol.
-- (Ver database/README.md.)
DELETE FROM groups
WHERE group_name IN ('Instructor', 'Aprendiz');


INSERT INTO groups (group_name, is_active)
VALUES
    ('Cocinero', true),
    ('Mesero',   true),
    ('Caja',     true),
    ('Invitado', true)
ON CONFLICT (group_name) DO NOTHING;
