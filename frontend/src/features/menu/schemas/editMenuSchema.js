import { z } from "zod";
import { menuCategories } from "../data/categories";

const VALID_CATEGORY_VALUES = menuCategories.map((c) => c.value);

// Sin validación de duplicados contra el mock: los datos reales están en la BD.
export function createEditMenuSchema() {
  return z
    .object({
      nombre: z
        .string({ message: "El nombre es requerido" })
        .min(2, "El nombre debe tener mínimo 2 caracteres")
        .max(60, "El nombre es demasiado largo"),

      precio: z.coerce
        .number({ message: "El precio debe ser un número válido" })
        .positive("El precio debe ser mayor a 0"),

      categoria: z
        .string({ message: "Debe seleccionar una categoría" })
        .min(1, "Debe seleccionar una categoría")
        .refine((val) => VALID_CATEGORY_VALUES.includes(val), {
          message: "La categoría seleccionada no está registrada",
        }),

      descripcion: z
        .string({ message: "La descripción es requerida" })
        .min(5, "La descripción debe tener mínimo 5 caracteres")
        .max(200, "La descripción es demasiado larga"),

      estado: z.boolean(),

    });
}

export const createMenuSchema = createEditMenuSchema;
