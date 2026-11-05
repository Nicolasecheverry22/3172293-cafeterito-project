-- Asocia los permisos de usuarios al content_type 'users.user' (content_type_id = 1)
UPDATE permissions
SET content_type_id = 1
WHERE permission_codename IN (
    'list_user',
    'create_user',
    'report_user',
    'disable_user'
);
