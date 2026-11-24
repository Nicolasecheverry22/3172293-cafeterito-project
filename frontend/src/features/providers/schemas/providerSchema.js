import { z } from "zod";
import { providers as existingProviders } from "../data/providers";
import { imageFilesField } from "@/shared/utils/image";

export function createProviderSchema({ currentProviderId = null } = {}) {
  return z
    .object({
      // Alineado con el backend (provider.schema.js): sin Tarjeta de Identidad
      providerDocumentType: z.enum(["NIT", "CC", "CE", "PEP", "PPT"], {
        message: "Debe seleccionar un tipo de documento válido",
      }),

      providerDocumentNumber: z
        .string()
        .trim()
        .regex(/^\d{6,15}(-\d)?$/, "Documento inválido: 6 a 15 dígitos (el NIT puede llevar dígito de verificación, ej. 900123456-7)"),

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

      providerPhone: z.string().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos"),

      productFood: z.boolean(),
      productSupplies: z.boolean(),
      productFruits: z.boolean(),
      productOthers: z.boolean(),

      // Logo opcional: PNG/JPG/WEBP, máx. 2 MB (igual que Joi)
      images: imageFilesField(),
    })
    // Solo el NIT admite dígito de verificación
    .refine(
      (data) => data.providerDocumentType === "NIT" || /^\d{6,15}$/.test(data.providerDocumentNumber),
      { message: "El documento debe ser numérico (6 a 15 dígitos)", path: ["providerDocumentNumber"] }
    )
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