import { z } from "zod";
import { ordens as existingOrders } from "../data/ordens";
import { menuDishesData } from "../data/orderMockData";

const VALID_DISH_VALUES = menuDishesData.map((d) => d.value);

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

// Campos base obligatorios para ordenes (incluyendo status y clientName)
const baseOrderFields = {
  clientName: z.string().min(2, "El nombre del cliente es obligatorio"),
  tableNumber: z.coerce
    .number()
    .int("El número de mesa debe ser un entero")
    .positive("Ingrese un número de mesa válido"),
  waiterId: z.string().min(1, "Debe seleccionar un empleado encargado"),
  status: z.string().min(1, "Debe seleccionar un estado para la orden"),
  observations: z.string().max(300, "Las observaciones son demasiado largas").optional(),
  items: z.array(orderItemSchema).min(1, "La orden debe tener al menos un platillo"),
};

// Esquema para CREAR
export const createOrderSchema = () => {
  return z
    .object(baseOrderFields)
    .refine(
      (data) =>
        !existingOrders.some(
          (order) =>
            order.tableNumber === Number(data.tableNumber) &&
            order.status === "activa"
        ),
      { message: "Esta mesa ya tiene una orden activa", path: ["tableNumber"] }
    );
};

// Esquema para EDITAR (todos obligatorios excepto observaciones)
export const updateOrderSchema = () => {
  return z.object(baseOrderFields);
};