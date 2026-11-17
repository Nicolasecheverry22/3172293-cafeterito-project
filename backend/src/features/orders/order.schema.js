// Validación de entrada del feature orders (RFADMIN26–30).
// El precio NO se acepta del cliente: stripUnknown elimina price/unitPrice de los items
// y el servicio toma el precio vigente de la BD.
import { Joi, isoDate } from "../../utils/joi.js";
import { paginationFields } from "../../utils/listQuery.js";
import { ORDER_STATUSES } from "./order.constants.js";

const orderItem = Joi.object({
  productId: Joi.number().integer().positive().required().label("El platillo"),
  quantity: Joi.number().integer().positive().required().label("La cantidad"),
});

const orderFields = {
  tableNumber: Joi.number().integer().positive().required().label("El número de mesa"),
  waiterId: Joi.number().integer().positive().empty("").allow(null).label("El empleado encargado"),
  observations: Joi.string().trim().max(300).empty("").allow(null).label("Las observaciones"),
  items: Joi.array()
    .items(orderItem)
    .min(1)
    .required()
    .label("Los platillos")
    .messages({ "array.min": "La orden debe tener al menos un platillo" }),
};

export const createOrderSchema = Joi.object(orderFields);

export const updateOrderSchema = Joi.object({
  ...orderFields,
  status: Joi.string()
    .trim()
    .lowercase()
    .valid(...ORDER_STATUSES)
    .required()
    .label("El estado"),
});

export const orderReportQuery = Joi.object({
  tableNumber: Joi.number().integer().positive().empty("").label("El número de mesa"),
});

// GET /api/orders — filtros opcionales y paginación (solo si llegan page y limit)
export const orderListQuery = Joi.object({
  status: Joi.string().trim().lowercase().valid(...ORDER_STATUSES).empty("").label("El estado"),
  tableNumber: Joi.number().integer().positive().empty("").label("El número de mesa"),
  from: isoDate().empty("").label("La fecha inicial"),
  to: isoDate().empty("").label("La fecha final"),
  ...paginationFields,
});
