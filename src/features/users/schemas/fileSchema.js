import { z } from "zod";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024; //10MB

export const fileSchema = z.object({
    files: z
      .array(
        z
          .instanceof(File)
          .refine((f) => ACCEPTED_TYPES.includes(f.type), "Tipo invalido")
          .refine((f) => f.size <= MAX_SIZE, "Max 10MB"),
      )
      .min(1, "requerido")
      .max(12, "Max 12 archivos")
});