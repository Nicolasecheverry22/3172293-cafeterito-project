// Importamos el servivico de usuarios el controlador no implementa logica de negocio 
// solo delega la operacion al service correspondiente

import { userService } from "./user.service.js";

// Exportamos un objeto controlador agrupar handlers en un objeto permite escalibilidad 
export const userController = {
    // Metodo encargado de manejar la creacion de un usuario se asume que este metodo sera usado como handlerenuna ruta de express

    async create(req, res){


        // Log del cuerpo de la peticion 
        // Util en desarollo para validar que el fronttend envie correctamente los datos en produccion suele reemplazarse por logging estructurando o eliminarse 
        console.log("BODY RECIBIDO:", req.body); //CLAVE

        try{
            // LLamamos al servicio de usuaeio pasando los datos recibidos aqui ocurre la logica real del negovio

            const user= await userService.createUser(req.body);

            // Respuesta http en caso de exito 
            // 201: Recurso creado correctamente segun el estandar REST 
            res.status(201).json({
                message: "Usuario creado correctamente",
                // Retornamos unicamente el ID del usuario creado yu evita exponer infromacion senisble innecesariamente 
                userId: user.id,
            });
            
        } catch(err){
            console.log("ERROR BACKEND:", err);

            // 23505 = unique_violation de PostgreSQL (correo o documento repetido)
            if (err.code === "23505") {
                return res.status(409).json({
                    error: "Ya existe un usuario con ese correo o número de documento",
                });
            }

            res.status(err.statusCode || 500).json({
                error:err.message,
            });
        }
    },

   
    async getAll(req, res){
        try{
            const users = await userService.getAll();
            res.json(users);
        } catch(err){
            console.log("ERROR BACKEND:", err);

            res.status(500).json({
                error: err.message,
            });
        }
    },

    // Obtener un usuario por su id (vista de detalle)
    async getById(req, res){
        try{
            const id = Number(req.params.id);
            const user = await userService.getById(id);

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json(user);
        } catch(err){
            console.log("ERROR BACKEND:", err);

            res.status(500).json({
                error: err.message,
            });
        }
    },

    // Obtener datos para el reporte de usuarios
    async getReportData(req, res) {
        try {
            const { document } = req.query;
            const users = await userService.getReportData(document);
            res.json(users);
        } catch(err){
            console.log("ERROR BACKEND REPORT:", err);
            res.status(500).json({ error: err.message });
        }
    },

    // Actualizar datos y roles de un usuario
    async update(req, res){
        try{
            const id = Number(req.params.id);
            const updated = await userService.updateUser(id, req.body);

            if (!updated) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json({ message: "Usuario actualizado correctamente", userId: updated.id });
        } catch(err){
            console.log("ERROR BACKEND:", err);

            if (err.code === "23505") {
                return res.status(409).json({
                    error: "Ya existe otro usuario con ese correo o número de documento",
                });
            }

            res.status(err.statusCode || 500).json({ error: err.message });
        }
    },

    // Eliminar un usuario por su id
    async remove(req, res){
        try{
            const id = Number(req.params.id);
            const deleted = await userService.remove(id);

            if (!deleted) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json({
                message: "Usuario eliminado correctamente",
                userId: deleted.id,
            });
        } catch(err){
            console.log("ERROR BACKEND:", err);
            res.status(500).json({ error: err.message });
        }
    },

    // Permisos del usuario (directos + heredados de grupos)
    async getPermissions(req, res){
        try{
            const id = Number(req.params.id);
            const permissions = await userService.getPermissions(id);
            res.json(permissions);
        } catch(err){
            console.log("ERROR BACKEND:", err);
            res.status(err.statusCode || 500).json({ error: err.message });
        }
    },

    // Reemplaza los permisos directos del usuario
    async updatePermissions(req, res){
        try{
            const id = Number(req.params.id);
            const { permissionIds } = req.body;

            await userService.updatePermissions(id, permissionIds);

            res.json({ message: "Permisos actualizados correctamente" });
        } catch(err){
            console.log("ERROR BACKEND:", err);
            res.status(err.statusCode || 500).json({ error: err.message });
        }
    }
}