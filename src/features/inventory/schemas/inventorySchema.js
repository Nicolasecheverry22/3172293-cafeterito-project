import { z } from "zod";
import { inventory as existingInventory } from "../data/inventory";

const ALLOWED_IMAGE_TYPES = ["image/png"];

export function createInventorySchema({ currentProductId = null } = {}) {
  return z
    .object({
      productId: z.string().min(1, "El ID del producto es requerido"),

      productName: z
        .string()
        .min(2, "El nombre debe tener mínimo 2 caracteres")
        .max(80, "El nombre es demasiado largo"),

      productDescription: z.string().max(300, "La descripción es demasiado larga").optional(),

      productCategory: z.string().min(1, "Debe seleccionar una categoría"),

      productCode: z
        .string()
        .min(1, "El código de barras es requerido")
        .regex(/^[0-9A-Za-z-]+$/, "El código de barras contiene caracteres inválidos"),

      foodPrice: z.coerce.number({ message: "El precio debe ser un número" }).positive("El precio debe ser mayor a 0"),

      foodBrand: z.string().min(1, "La marca es requerida"),

      foodQuantity: z.coerce
        .number({ message: "La cantidad debe ser un número" })
        .int("La cantidad debe ser un número entero")
        .nonnegative("La cantidad no puede ser negativa"),

      productImage: z.array(z.instanceof(File)).min(1, "Debe cargar al menos una imagen"),
    })
    .refine((data) => data.productImage.every((file) => ALLOWED_IMAGE_TYPES.includes(file.type)), {
      message: "Solo se permiten imágenes en formato PNG",
      path: ["productImage"],
    })
    .refine(
      (data) => !existingInventory.some((p) => p.productId === data.productId && p.productId !== currentProductId),
      { message: "Este ID de producto ya existe", path: ["productId"] }
    )
    .refine(
      (data) =>
        !existingInventory.some(
          (p) => p.productCode === data.productCode && p.productId !== currentProductId
        ),
      { message: "Este código de barras ya está registrado", path: ["productCode"] }
    );
}

export const inventorySchema = createInventorySchema();