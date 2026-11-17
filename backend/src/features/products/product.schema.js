// Validación de entrada del feature products (platillos del menú, RFADMIN20–24).
import { Joi } from "../../utils/joi.js";

// Usado en POST (crear) y PUT (actualizar): ambos envían el platillo completo.
export const productSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(120).required().label("El nombre"),
  category: Joi.string().trim().min(1).max(100).required().label("La categoría"),
  price: Joi.number().positive().precision(2).max(9999999999).required().label("El precio"),
  description: Joi.string().trim().max(500).empty("").allow(null).label("La descripción"),
  isAvailable: Joi.boolean().default(true).label("El estado"),
});

// PATCH /api/products/:id/status
export const productStatusSchema = Joi.object({
  isAvailable: Joi.boolean().required().label("El estado"),
});

export const productReportQuery = Joi.object({
  category: Joi.string().trim().max(100).empty("").label("La categoría"),
});
