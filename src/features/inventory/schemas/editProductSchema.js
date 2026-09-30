import { z } from "zod";
import { inventory as existingProducts } from "../data/inventory";

export function createEditProductSchema({ currentProductId }) {
  return z
    .object({
      productName: z
        .string()
        .min(3, "El nombre del producto debe tener al menos 3 caracteres")
        .max(60, "El nombre es demasiado largo"),
      category: z
        .string()
        .min(1, "Debe seleccionar una categoría"),
      stock: z
        .union([z.string(), z.number()])
        .refine((val) => val !== "" && !isNaN(Number(val)) && Number(val) >= 0, {
          message: "El stock debe ser un número mayor o igual a 0",
        }),
      unit: z
        .string()
        .min(1, "La unidad de medida es requerida"),
      price: z
        .union([z.string(), z.number()])
        .refine((val) => val !== "" && !isNaN(Number(val)) && Number(val) > 0, {
          message: "El precio debe ser un número mayor a 0",
        }),
      isActive: z.boolean(),
    })
    .refine(
      (data) =>
        !existingProducts.some(
          (p) =>
            (p.productName ?? p.nameProduct ?? "").toLowerCase().trim() ===
              data.productName.toLowerCase().trim() &&
            p.id !== currentProductId
        ),
      {
        message: "Ya existe otro producto registrado con este nombre",
        path: ["productName"],
      }
    );
}