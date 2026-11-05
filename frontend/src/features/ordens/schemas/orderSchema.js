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

// Esquema para CREAR: solo los campos que tiene el formulario.
// (Antes exigía clientName y status, que el formulario no envía -> siempre fallaba.)
// "Una mesa = una orden activa" la valida la BD (índice uq_orders_active_table).
export const createOrderSchema = () =>
  z.object({
    tableNumber: tableNumberSchema,
    waiterId: z.string().min(1, "Debe seleccionar un empleado encargado"),
    observations: observationsSchema,
    items: z
      .array(orderItemSchema)
      .min(1, "La orden debe tener al menos un platillo")
      .refine((items) => items.every((item) => item.dishId), {
        message: "Seleccione un platillo en cada fila o elimine las vacías",
      }),
  });

// Esquema para EDITAR: mismos campos que guarda la tabla orders
export const updateOrderSchema = () =>
  z.object({
    tableNumber: tableNumberSchema,
    waiterId: z.string().min(1, "Debe seleccionar un empleado encargado"),
    status: z.enum(["activa", "pagada", "cancelada"], {
      message: "Debe seleccionar un estado válido",
    }),
    observations: observationsSchema,
    items: z.array(orderItemSchema).min(1, "La orden debe tener al menos un platillo"),
  });
