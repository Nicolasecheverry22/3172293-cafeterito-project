import { z } from "zod";
import { imageFilesField } from "@/shared/utils/image";

// Sin validación de duplicados contra el mock: los datos reales están en la BD.
export function createEditProviderSchema() {
  return z
    .object({
      nit: z
        .string({ required_error: "El NIT o número de documento es requerido" })
        .trim()
        .regex(/^\d{6,15}(-\d)?$/, "Documento inválido: 6 a 15 dígitos (el NIT puede llevar dígito de verificación, ej. 900123456-7)"),

      providerName: z
        .string({ required_error: "El nombre es requerido" })
        .trim()
        .min(3, "El nombre debe tener mínimo 3 caracteres")
        .max(60, "El nombre es demasiado largo"),

      providerAddress: z
        .string({ required_error: "La dirección es requerida" })
        .trim()
        .min(1, "La dirección es requerida"),

      providerPhone: z
        .string({ required_error: "El teléfono es requerido" })
        .trim()
        .regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos"),

      providerEmail: z
        .string({ required_error: "El correo es requerido" })
        .trim()
        .min(1, "El correo es requerido")
        .email("Debe ingresar un correo electrónico válido"),

      productService: z
        .string({ required_error: "Debe especificar los productos suministrados" })
        .trim()
        .min(1, "Debe especificar los productos suministrados"),

      isActive: z.boolean().optional(),
      file: imageFilesField(),
    });
}

export const editProviderSchema = createEditProviderSchema();