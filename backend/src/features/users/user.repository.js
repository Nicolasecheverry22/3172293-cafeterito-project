// Importamos el pool de la conexion 
//  Easste pool es una instancia  ompartida configurada en la capad de la insfraestructura 

import { pool } from "../../config/db.js";

// Exportamos el repositorio de usuarios
// El repositorio encpasula todas las consultas SQL relacionadas con users.
export const userRepository = {

// Metodod encarhgado de crear un usuario en la base de datos 
// Recibe un objeto con los datos ya validos y rpocesados por el service
async create(userData) {
     
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
    const result = await pool.query(query, values);

    return result.rows[0];
},

// Asigna un grupo al usuario (tabla user_groups). Idempotente.
async assignGroup(userId, groupId) {
    await pool.query(
        `INSERT INTO user_groups (user_id, group_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, group_id) DO NOTHING`,
        [userId, groupId]
    );
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
        is_active
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
        user_document_number AS "userDocument",
        is_active
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