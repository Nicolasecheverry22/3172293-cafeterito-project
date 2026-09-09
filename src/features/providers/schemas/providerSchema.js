import { z } from "zod";
import { providers as existingProviders } from "../data/providers";

export function createProviderSchema({ currentProviderId = null } = {}) {
  return z
    .object({
      providerDocumentType: z.string().min(1, "Debe seleccionar un tipo de documento"),

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
        .min(1, "El correo es requerido")
        .email("Debe ingresar un correo válido"),

      providerEmailConfirm: z
        .string()
        .min(1, "Debe confirmar el correo")
        .email("Debe ingresar un correo válido"),

      providerAddress: z
        .string()
        .min(5, "La dirección es muy corta")
        .max(100, "La dirección es demasiado larga"),

      providerPhone: z.string().regex(/^[0-9]{10}$/, "El teléfono debe tener exactamente 10 dígitos"),

      productFood: z.boolean(),
      productSupplies: z.boolean(),
      productFruits: z.boolean(),
      productOthers: z.boolean(),

      images: z.array(z.instanceof(File)).optional(),
    })
    .refine((data) => data.providerEmail === data.providerEmailConfirm, {
      message: "Los correos electrónicos no coinciden",
      path: ["providerEmailConfirm"],
    })
    .refine(
      (data) => data.productFood || data.productSupplies || data.productFruits || data.productOthers,
      { message: "Debe seleccionar al menos un producto suministrado", path: ["productFood"] }
    )
    .refine(
      (data) =>
        !existingProviders.some(
          (p) =>
            p.providerDocumentNumber === data.providerDocumentNumber &&
            p.id !== currentProviderId
        ),
      { message: "Este número de documento ya está registrado", path: ["providerDocumentNumber"] }
    );
}

export const providerSchema = createProviderSchema();