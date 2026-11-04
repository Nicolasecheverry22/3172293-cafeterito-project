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
    }
}