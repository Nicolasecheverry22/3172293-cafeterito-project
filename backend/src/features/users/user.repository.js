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
    user_document_types,
    user_document_number,
    user_password,
    user_avatar_url,
    is_staff,
    is_active,
    is_superuser
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id;
    `
    // Array de valores que pasan al query 
    // El orden debe de coincidir exactamente con los placeholders del sql 
    const values = [
        userName,
        userEmail,
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
}
}