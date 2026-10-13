import { z } from "zod";
import { providers as existingProviders } from "../data/providers";

export function createEditProviderSchema({ currentProviderId = null } = {}) {
  return z
    .object({
      providerDocumentType: z
        .string({ required_error: "Debe seleccionar un tipo de documento" })
        .trim()
        .min(1, "Debe seleccionar un tipo de documento"),

      nit: z
        .string({ required_error: "El NIT o número de documento es requerido" })
        .trim()
        .min(5, "El NIT o documento debe tener mínimo 5 caracteres")
        .max(20, "El NIT o documento es demasiado largo"),

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
        .regex(/^[0-9]{10}$/, "El teléfono debe tener exactamente 10 dígitos numéricos"),

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
      file: z.any().optional(),
    })

    // Validar que el NIT no pertenezca a otro proveedor registrado
    .refine(
      (data) =>
        !existingProviders.some(
          (p) =>
            p.nit?.toString().trim() === data.nit?.toString().trim() &&
            String(p.id) !== String(currentProviderId)
        ),
      { message: "Este NIT/Documento ya está registrado", path: ["nit"] }
    )

    // Validar que el correo no pertenezca a otro proveedor registrado
    .refine(
      (data) =>
        !existingProviders.some(
          (p) =>
            p.providerEmail?.toLowerCase().trim() === data.providerEmail?.toLowerCase().trim() &&
            String(p.id) !== String(currentProviderId)
        ),
      { message: "Este correo ya está registrado", path: ["providerEmail"] }
    );
}

export const editProviderSchema = createEditProviderSchema();