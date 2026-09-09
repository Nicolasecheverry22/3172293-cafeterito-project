import { z } from "zod";
import { ordens as existingOrders } from "../data/ordens";
import { menuDishesData } from "../data/orderMockData";

const VALID_DISH_VALUES = menuDishesData.map((d) => d.value);

const orderItemSchema = z.object({
  id: z.string(),
  dishId: z
    .string()
    .min(1, "Debe seleccionar un platillo")
    .refine((val) => VALID_DISH_VALUES.includes(val), {
      message: "El platillo seleccionado no pertenece al menú",
    }),
  quantity: z.coerce
    .number()
    .int("La cantidad debe ser entera")
    .positive("La cantidad debe ser mayor a 0"),
});

export function createOrderSchema({ currentOrderId = null } = {}) {
  return z
    .object({
      tableNumber: z.coerce
        .number()
        .int("El número de mesa debe ser un entero")
        .positive("Ingrese un número de mesa válido"),
      waiterId: z.string().min(1, "Debe seleccionar un empleado encargado"),
      observations: z.string().max(300, "Las observaciones son demasiado largas").optional(),
      items: z.array(orderItemSchema).min(1, "La orden debe tener al menos un platillo"),
    })
    .refine(
      (data) =>
        !existingOrders.some(
          (order) =>
            order.tableNumber === data.tableNumber &&
            order.status === "pending" &&
            order.id !== currentOrderId
        ),
      { message: "Esta mesa ya tiene una orden activa", path: ["tableNumber"] }
    );
}

export const orderSchema = createOrderSchema();