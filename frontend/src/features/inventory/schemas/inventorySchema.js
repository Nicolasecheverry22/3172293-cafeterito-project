import { z } from "zod";
import { inventory as existingInventory } from "../data/inventory";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function createInventorySchema({ currentProvisionId = null } = {}) {
  return z
    .object({
      provisionId: z.string().optional(),

      provisionName: z
        .string({ required_error: "El nombre del suministro es requerido" })
        .trim()
        .min(2, "El nombre debe tener mínimo 2 caracteres")
        .max(80, "El nombre es demasiado largo"),

      category: z
        .string({ required_error: "Debe seleccionar una categoría" })
        .trim()
        .min(1, "Debe seleccionar una categoría"),

      unit: z
        .string({ required_error: "Debe seleccionar una unidad de medida" })
        .trim()
        .min(1, "Debe seleccionar una unidad de medida"),

      batch: z
        .string({ required_error: "El código de lote es requerido" })
        .trim()
        .min(2, "El código de lote debe tener mínimo 2 caracteres")
        .max(30, "El lote es demasiado largo")
        .regex(/^[0-9A-Za-z-]+$/, "El lote contiene caracteres inválidos (solo letras, números y guiones)"),

      status: z
        .string({ required_error: "Debe seleccionar un estado" })
        .trim()
        .min(1, "Debe seleccionar un estado"),

      stock: z.coerce
        .number({ invalid_type_error: "El stock debe ser un número" })
        .int("El stock debe ser un número entero")
        .min(0, "El stock no puede ser negativo"),

      price: z.coerce
        .number({ invalid_type_error: "El precio debe ser un número" })
        .positive("El precio debe ser mayor a 0"),

      minStock: z.coerce
        .number({ invalid_type_error: "El stock mínimo debe ser un número" })
        .int("El stock mínimo debe ser entero")
        .min(0, "El stock mínimo no puede ser negativo"),

      maxStock: z.coerce
        .number({ invalid_type_error: "El stock máximo debe ser un número" })
        .int("El stock máximo debe ser entero")
        .positive("El stock máximo debe ser mayor a 0"),

      isActive: z.boolean().optional(),

      provisionImage: z
        .array(z.any())
        .optional()
        .refine(
          (files) => {
            if (!files || files.length === 0) return true;
            return files.every(
              (file) => file instanceof File && ALLOWED_IMAGE_TYPES.includes(file.type)
            );
          },
          { message: "Formato no válido. Solo se permiten imágenes (PNG, JPG, JPEG, WEBP)" }
        ),
    })

    .refine(
      (data) =>
        !existingInventory.some((p) => {
          const pBatch = (p.batch || p.provisionCode || "").toString().trim().toLowerCase();
          const newBatch = data.batch.trim().toLowerCase();
          const pId = String(p.provisionId || p.id);
          return pBatch === newBatch && pId !== String(currentProvisionId);
        }),
      { message: "Este número de lote ya existe en el inventario", path: ["batch"] }
    )

    .refine((data) => Number(data.maxStock) >= Number(data.minStock), {
      message: "El stock máximo no puede ser inferior al stock mínimo",
      path: ["maxStock"],
    })

    .refine((data) => Number(data.stock) >= Number(data.minStock), {
      message: "El stock actual no puede ser inferior al stock mínimo",
      path: ["stock"],
    });
}

export const inventorySchema = createInventorySchema();