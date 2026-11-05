INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
JOIN permissions p ON p.permission_codename IN ('list_user', 'create_user')
WHERE g.group_name = 'Administrador'
ON CONFLICT (group_id, permission_id) DO NOTHING;
