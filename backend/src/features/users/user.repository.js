// Importamos el pool de la conexion 
//  Easste pool es una instancia  ompartida configurada en la capad de la insfraestructura 

import { pool } from "../../config/db.js";

// Nombres de los grupos (roles) del usuario como arreglo: ["Caja", "Mesero"]
const USER_GROUPS_SUBQUERY = `
    COALESCE((
        SELECT ARRAY_AGG(g.group_name ORDER BY g.group_name)
        FROM user_groups ug
        INNER JOIN groups g ON g.group_id = ug.group_id
        WHERE ug.user_id = users.id
    ), '{}')`;

// Exportamos el repositorio de usuarios
// El repositorio encpasula todas las consultas SQL relacionadas con users.
export const userRepository = {

// Metodod encarhgado de crear un usuario en la base de datos 
// Recibe un objeto con los datos ya validos y rpocesados por el service.
// `db` permite reutilizar el método dentro de una transacción (client) o fuera de ella (pool).
async create(userData, db = pool) {
     
    // Destructuramos expliciatemnte aas propiedades esperadas esto hace el contrayo de datos claro y evita el acceder a las propiedades inexistentes 
    const{
        userName,
        userEmail,
        userPhone,
        userDocumentTypes,
        userDocumentNumber,
        userPassword,
        userAvatarUrl,
        isStaff,
        isActive,
        isSuperuser,
    } = userData; 

    const query= `
    INSERT INTO users(
    user_name,
    user_email,
    user_phone,
    user_document_types,
    user_document_number,
    user_password,
    user_avatar_url,
    is_staff,
    is_active,
    is_superuser
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING id;
    `
    // Array de valores que pasan al query 
    // El orden debe de coincidir exactamente con los placeholders del sql 
    const values = [
        userName,
        userEmail,
        userPhone,
        userDocumentTypes,
        userDocumentNumber,
        userPassword,
        userAvatarUrl,
        isStaff,
        isActive,
        isSuperuser,
    ]

    // Ejecutuamoa la consulta usando el pool
    // pool.query retorna un objeto con metadata y filass resultantes
    const result = await db.query(query, values);

    return result.rows[0];
},

async getByDocument(documentNumber) {
    const query = `
    SELECT
        id,
        user_name            AS "userName",
        user_email           AS "userEmail",
        user_phone           AS "userPhone",
        user_document_number AS "userDocument",
        CASE 
            WHEN is_active = TRUE THEN 'Activo' 
            ELSE 'Inactivo' 
        END                  AS "is_active",
        ${USER_GROUPS_SUBQUERY} AS groups
    FROM users
    WHERE ($1::text IS NULL OR user_document_number = $1)
    ORDER BY id;
    `;

    const result = await pool.query(query, [documentNumber || null]);
    return result.rows;
},

// Crea el usuario y lo asocia a sus grupos (roles) en UNA transacción:
// si falla la asignación de grupos, el usuario tampoco queda creado.
async createWithGroups(userData, groupNames) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const created = await this.create(userData, client);

        if (groupNames.length > 0) {
            // Resuelve los nombres a group_id directamente en SQL (un solo INSERT).
            await client.query(
                `INSERT INTO user_groups (user_id, group_id)
                 SELECT $1, g.group_id
                 FROM groups g
                 WHERE g.group_name = ANY($2::text[])
                   AND g.is_active = TRUE
                 ON CONFLICT (user_id, group_id) DO NOTHING`,
                [created.id, groupNames]
            );
        }

        await client.query("COMMIT");
        return created;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
},

// Actualiza los datos del usuario y reemplaza sus grupos en UNA transacción.
// La contraseña no se toca aquí. Retorna undefined si el id no existe.
async updateWithGroups(id, userData, groupNames) {
    const {
        userName,
        userEmail,
        userPhone,
        userDocumentTypes,
        userDocumentNumber,
        isActive,
        isSuperuser,
    } = userData;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `UPDATE users
             SET user_name = $1, user_email = $2, user_phone = $3,
                 user_document_types = $4, user_document_number = $5,
                 is_active = $6, is_superuser = $7
             WHERE id = $8
             RETURNING id`,
            [userName, userEmail, userPhone, userDocumentTypes, userDocumentNumber, isActive, isSuperuser, id]
        );

        if (!rows[0]) {
            await client.query("ROLLBACK");
            return undefined;
        }

        await client.query("DELETE FROM user_groups WHERE user_id = $1", [id]);
        await client.query(
            `INSERT INTO user_groups (user_id, group_id)
             SELECT $1, g.group_id
             FROM groups g
             WHERE g.group_name = ANY($2::text[])
               AND g.is_active = TRUE`,
            [id, groupNames]
        );

        await client.query("COMMIT");
        return rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
},

// Permisos de un usuario: directos (user_permissions) y heredados de sus grupos.
// Un permiso puede ser directo y heredado al mismo tiempo.
async getPermissionsByUserId(userId) {
    const query = `
    SELECT
        p.permission_id,
        p.permission_name,
        p.permission_codename,
        EXISTS (
            SELECT 1 FROM user_permissions up
            WHERE up.user_id = $1 AND up.permission_id = p.permission_id
        ) AS is_direct,
        EXISTS (
            SELECT 1
            FROM user_groups ug
            INNER JOIN group_permissions gp ON gp.group_id = ug.group_id
            WHERE ug.user_id = $1 AND gp.permission_id = p.permission_id
        ) AS is_inherited
    FROM permissions p
    WHERE EXISTS (
            SELECT 1 FROM user_permissions up
            WHERE up.user_id = $1 AND up.permission_id = p.permission_id
        )
       OR EXISTS (
            SELECT 1
            FROM user_groups ug
            INNER JOIN group_permissions gp ON gp.group_id = ug.group_id
            WHERE ug.user_id = $1 AND gp.permission_id = p.permission_id
        )
    ORDER BY p.permission_name;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
},

// Reemplaza los permisos DIRECTOS del usuario (no toca los heredados de grupos).
async updatePermissions(userId, permissionIds) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            "DELETE FROM user_permissions WHERE user_id = $1",
            [userId]
        );

        if (permissionIds.length > 0) {
            // unnest inserta todos los ids en una sola consulta (evita N round-trips)
            await client.query(
                `INSERT INTO user_permissions (user_id, permission_id)
                 SELECT $1, unnest($2::int[])`,
                [userId, permissionIds]
            );
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
},

// Metodo encargado de listar todos los usuarios registrados
// Usamos alias (AS "userName", ...) para que la respuesta coincida
// con los campos que espera la tabla del frontend
async getAll() {
    const query = `
    SELECT
        id,
        user_name            AS "userName",
        user_email           AS "userEmail",
        user_phone           AS "userPhone",
        user_document_number AS "userDocument",
        is_superuser,
        is_staff,
        is_active,
        ${USER_GROUPS_SUBQUERY} AS groups
    FROM users
    ORDER BY id;
    `;

    const result = await pool.query(query);

    return result.rows;
},

// Metodo encargado de obtener un usuario por su id
async getById(id) {
    const query = `
    SELECT
        id,
        user_name            AS "userName",
        user_email           AS "userEmail",
        user_phone           AS "userPhone",
        user_document_types  AS "userDocumentTypes",
        user_document_number AS "userDocument",
        user_avatar_url      AS "userAvatarUrl",
        is_superuser,
        is_staff,
        is_active,
        TO_CHAR(created_at, 'YYYY-MM-DD') AS "createdAt",
        ${USER_GROUPS_SUBQUERY} AS groups
    FROM users
    WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
},

// Elimina un usuario por su id. Las filas en user_groups/user_permissions
// se eliminan en cascada por las llaves foráneas ON DELETE CASCADE.
async remove(id) {
    const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [id]
    );
    return result.rows[0];
}
}