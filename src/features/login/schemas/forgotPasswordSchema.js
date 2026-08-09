import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, { message: "El correo electrónico es requerido." })
        .email({ message: "Ingresa un correo electrónico válido." }),
});