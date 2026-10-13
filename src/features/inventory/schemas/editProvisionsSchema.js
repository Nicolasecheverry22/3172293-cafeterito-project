import { z } from "zod";
import { inventory as existingInventory } from "../data/inventory";

export function createEditProvisionsSchema({ currentProvisionId = null } = {}) {
  return z
    .object({
      provisionName: z
        .string({ required_error: "El nombre es requerido" })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(80, "El nombre es demasiado largo"),

      category: z
        .string({ required_error: "Debe seleccionar una categoría" })
        .trim()
        .min(1, "Debe seleccionar una categoría"),

      status: z
        .string({ required_error: "Debe seleccionar un estado" })
        .trim()
        .min(1, "Debe seleccionar un estado"),

      unit: z
        .string({ required_error: "Debe seleccionar una unidad de medida" })
        .trim()
        .min(1, "Debe seleccionar una unidad de medida"),

      batch: z
        .string({ required_error: "El código de lote es requerido" })
        .trim()
        .min(2, "El lote debe tener al menos 2 caracteres")
        .regex(/^[0-9A-Za-z-]+$/, "El lote solo puede contener letras, números y guiones"),

      stock: z.coerce
        .number({ invalid_type_error: "El stock debe ser un número" })
        .int("El stock debe ser un número entero")
        .min(0, "El stock no puede ser negativo"),

      minStock: z.coerce
        .number({ invalid_type_error: "El stock mínimo debe ser un número" })
        .int("El stock mínimo debe ser entero")
        .min(0, "El stock mínimo no puede ser negativo"),

      maxStock: z.coerce
        .number({ invalid_type_error: "El stock máximo debe ser un número" })
        .int("El stock máximo debe ser entero")
        .positive("El stock máximo debe ser mayor a 0"),

      price: z.coerce
        .number({ invalid_type_error: "El precio debe ser un número" })
        .positive("El precio debe ser un número mayor a 0"),

      isActive: z.boolean().optional(),
      provisionImage: z.any().optional(),
    })

    // Unicidad del lote
    .refine(
      (data) =>
        !existingInventory.some((p) => {
          const pBatch = (p.batch || p.provisionCode || "").toString().trim().toLowerCase();
          const newBatch = data.batch.trim().toLowerCase();
          const pId = String(p.id || p.provisionId);
          return pBatch === newBatch && pId !== String(currentProvisionId);
        }),
      { message: "Este número de lote ya está registrado en otro suministro", path: ["batch"] }
    )

    // Stock máximo >= Stock mínimo
    .refine((data) => Number(data.maxStock) >= Number(data.minStock), {
      message: "El stock máximo no puede ser inferior al stock mínimo",
      path: ["maxStock"],
    })

    // Stock actual >= Stock mínimo
    .refine((data) => Number(data.stock) >= Number(data.minStock), {
      message: "El stock actual no puede ser inferior al stock mínimo",
      path: ["stock"],
    });
}

export const editProvisionsSchema = createEditProvisionsSchema();