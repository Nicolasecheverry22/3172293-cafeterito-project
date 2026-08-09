import { z } from "zod";

export const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }), 
    confirmPassword: z
        .string()
        .min(1, { message: "Debes confirmar tu contraseña." })
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"], 
});