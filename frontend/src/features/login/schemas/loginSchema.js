import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Debe ser un correo electrónico válido"),
  password: z
    .string()
    .min(8, "Contraseña debe tener minimo 8 caracteres")
    .regex(/[A-Z]/,"Debe contener almenos una mayuscula")
    .regex(/[a-z]/,"Debe contener almenos una minuscula")
    .regex(/[0-9]/,"Debe contener almenos un numero ")
    .regex(/[^A-Za-z0-9]/,"Debe contener almenos un caracter especial"),

  rememberMe: z.boolean().optional(),
});