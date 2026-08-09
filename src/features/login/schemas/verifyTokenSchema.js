import { z } from "zod";

export const verifyTokenSchema = z.object({
    token: z
        .string()
        .min(1, { message: "El token es requerido." })
        .regex(/^\d+$/, { message: "El token solo puede contener números." })
        .length(6, { message: "El token debe tener exactamente 6 números." })
});