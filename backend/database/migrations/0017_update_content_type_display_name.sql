-- Carga los nombres amigables de cada modulo (idempotente: conserva los ya definidos)
UPDATE content_type
SET display_name =
    CASE app_label
        WHEN 'users'  THEN 'Usuarios'
        WHEN 'groups' THEN 'Grupos'
        WHEN 'tasks'  THEN 'Tareas'
        WHEN 'access' THEN 'Permisos'
        ELSE display_name
    END;
