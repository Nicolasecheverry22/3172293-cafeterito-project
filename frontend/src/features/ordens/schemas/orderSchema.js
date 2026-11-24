import { z } from "zod";

const orderItemSchema = z.object({
  id: z.string().optional(),
  dishId: z.string().optional(),
  dish: z.string().optional(),
  quantity: z.coerce
    .number()
    .int("La cantidad debe ser entera")
    .positive("La cantidad debe ser mayor a 0"),
  price: z.coerce.number().positive().optional(),
});

const tableNumberSchema = z.coerce
  .number()
  .int("El número de mesa debe ser un entero")
  .positive("Ingrese un número de mesa válido");

const observationsSchema = z
  .string()
  .max(300, "Las observaciones son demasiado largas")
  .optional();

// Esquema para CREAR. Sin waiterId: el backend asigna al usuario del token.
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

// Esquema para EDITAR: mismos campos que guarda la tabla orders
export const updateOrderSchema = () =>
  z.object({
    tableNumber: tableNumberSchema,
    waiterId: z.string().min(1, "Debe seleccionar un empleado encargado"),
    // Destinos de ORDER_TRANSITIONS (order.constants.js): "pagada" solo vía comprobante de venta
    status: z.enum(["activa", "lista para entrega", "cancelada"], {
      message: "Debe seleccionar un estado válido (para pagar, use Cobrar)",
    }),
    observations: observationsSchema,
    items: z.array(orderItemSchema).min(1, "La orden debe tener al menos un platillo"),
  });
