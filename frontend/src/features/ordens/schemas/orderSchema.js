import { z } from "zod";

const observationsSchema = z
  .string()
  .max(300, "Las observaciones son demasiado largas")
  .optional();

// Esquema de la orden (crear y editar con OrderComposer). Sin waiterId ni precios: el
// backend asigna el mesero del token (o conserva el actual) y toma los precios de la BD.
// "Una mesa = una orden activa" la valida la BD (índice uq_orders_active_table).
export const createOrderSchema = () =>
  z.object({
    tableNumber: z
      .number({ message: "Selecciona una mesa disponible" })
      .int()
      .positive("Selecciona una mesa disponible"),
    observations: observationsSchema,
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().positive().max(99, "Máximo 99 por platillo"),
        })
      )
      .min(1, "Agrega al menos un platillo a la orden"),
  });
