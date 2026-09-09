import { z } from "zod";
import { menu as existingMenu } from "../data/menu";
import { menuCategories } from "../data/categories";

const VALID_CATEGORY_VALUES = menuCategories.map((c) => c.value);

export function createMenuSchema({ currentMenuItemId = null } = {}) {
  return z
    .object({
      nombre: z
        .string()
        .min(2, "El nombre debe tener mínimo 2 caracteres")
        .max(60, "El nombre es demasiado largo"),

      precio: z.coerce
        .number({ message: "El precio debe ser un número" })
        .positive("El precio debe ser mayor a 0"),

      categoria: z
        .string()
        .min(1, "Debe seleccionar una categoría")
        .refine((val) => VALID_CATEGORY_VALUES.includes(val), {
          message: "La categoría seleccionada no está registrada",
        }),

      descripcion: z
        .string()
        .min(5, "La descripción debe tener mínimo 5 caracteres")
        .max(200, "La descripción es demasiado larga"),

      estado: z.boolean(),

      imagen: z.array(z.instanceof(File)).min(1, "Debe cargar una imagen del platillo"),
    })
    .refine(
      (data) =>
        !existingMenu.some(
          (item) =>
            item.nombre.trim().toLowerCase() === data.nombre.trim().toLowerCase() &&
            item.categoria === data.categoria &&
            item.id !== currentMenuItemId
        ),
      {
        message: "Ya existe un platillo con este nombre en la misma categoría",
        path: ["nombre"],
      }
    );
}

export const menuSchema = createMenuSchema();