import { z } from "zod";

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(10, "La contraseña debe tener mínimo 10 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un símbolo"),
  confirmPassword: z
    .string()
    .min(1, "Debes confirmar tu contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});