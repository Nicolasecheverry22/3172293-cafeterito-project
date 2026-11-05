// Importamos el servivico de usuarios el controlador no implementa logica de negocio 
// solo delega la operacion al service correspondiente

import { userService } from "./user.service.js";

// Exportamos un objeto controlador agrupar handlers en un objeto permite escalibilidad 
export const userController = {
    // Metodo encargado de manejar la ccreacion de un usuario se asume que este metodo sera usado como handlerenuna ruta de express

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

            res.status(500).json({
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
    }
}