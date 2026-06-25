import { z } from "zod";

export const providerSchema = z.object({
  providerDocumentType: z
    .string()
    .min(1, "Debe seleccionar un tipo de documento"),

  providerDocumentNumber: z
    .string()
    .min(5, "Número de documento inválido")
    .max(20, "Número de documento demasiado largo"),

  providerName: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

  isActive: z.boolean(),

  providerEmail: z
    .string()
    .email("Debe ingresar un email válido")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El formato del correo no es válido"),

  providerEmailConfirm: z
    .string()
    .email("Debe ingresar un email válido"),

  providerAddress: z
    .string()
    .min(5, "La dirección es muy corta")
    .max(100, "La dirección es demasiado larga"),

  providerPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "El teléfono debe tener exactamente 10 dígitos"),

  productFood: z.boolean(),
  productSupplies: z.boolean(),
  productFruits: z.boolean(),
  productService: z.boolean(),
  productOthers: z.boolean(),
})
