// src/user/schemas/userSchemas.js
//  CORRECCION: agregar campos booleanos

import {z} from "zod";
import {fileSchema} from "../schemas/fileSchema";

    export const userSchema = z.object({
        userName: z
        .string()
        .min(3, "El nombre debe tener minimo 3 caracteres")
        .max(60,"El nombre es demasiado largo"),
    userEmail: z
        .email()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email valido"),
    userPhone: z
        .string()
        .regex(/^[0-9]{10}$/, "EL telefono debe de tener 10 digitos"),
    
    userImage: fileSchema.shape.files.optional(),


    userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),


    userDocumentNumber: z
        .string()
        .min(5,"numero de documento invalido")
        .max(20,"numero de documento demasiado largo"),

    userPassword: z
        .string()
        .min(8, "contraseña debe tener minimo 8 caracteres")
        .regex(/[A-Z]/,"debe contener almenos una mayuscula")
        .regex(/[a-z]/,"debe contener almenos una minuscula")
        .regex(/[0-9]/,"debe contener almenos un numero ")
        .regex(/[^A-Za-z0-9]/, "debe contener almenos un caracter especial"),

    isStaff : z.boolean(),
    isActive : z.boolean(),
    isSuperUser: z.boolean(),

});