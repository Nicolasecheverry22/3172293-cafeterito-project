import { z } from "zod";
import { providers as existingProviders } from "../data/providers";

export function createEditProviderSchema({ currentProviderId }) {
  return z
    .object({
      providerDocumentType: z.string().min(1, "Debe seleccionar un tipo de documento"),
      providerName: z
        .string()
        .min(3, "El nombre debe tener mínimo 3 caracteres")
        .max(60, "El nombre es demasiado largo"),
      providerAddress: z.string().min(1, "La dirección es requerida"),
      providerPhone: z.string().regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos"),
      providerEmail: z.string().min(1, "El correo es requerido").email("Debe ingresar un correo válido"),
      isActive: z.boolean(),
      productFood: z.boolean(),
      productSupplies: z.boolean(),
      productFruits: z.boolean(),
      productOthers: z.boolean(),
    })
    .refine((data) => data.productFood || data.productSupplies || data.productFruits || data.productOthers, {
      message: "Debe seleccionar al menos un producto suministrado",
      path: ["productFood"],
    })
    .refine(
      (data) =>
        !existingProviders.some(
          (p) => p.providerEmail?.toLowerCase() === data.providerEmail.toLowerCase() && p.id !== currentProviderId
        ),
      { message: "Este correo ya está registrado", path: ["providerEmail"] }
    );
}