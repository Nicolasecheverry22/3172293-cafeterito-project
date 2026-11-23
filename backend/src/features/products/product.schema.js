// Validación de entrada del feature products (platillos del menú, RFADMIN20–24).
import { Joi } from "../../utils/joi.js";
import { paginationFields } from "../../utils/listQuery.js";

// Usado en POST (crear) y PUT (actualizar): ambos envían el platillo completo.
export const productSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(120).required().label("El nombre"),
  category: Joi.string().trim().min(1).max(100).required().label("La categoría"),
  price: Joi.number().positive().precision(2).max(9999999999).required().label("El precio"),
  description: Joi.string().trim().max(500).empty("").allow(null).label("La descripción"),
  isAvailable: Joi.boolean().default(true).label("El estado"),
  // Imagen del platillo como data URL base64 (se guarda en la BD).
  productImage: Joi.string().dataUri().allow(null, "").label("La imagen"),
});

// PATCH /api/products/:id/status
export const productStatusSchema = Joi.object({
  isAvailable: Joi.boolean().required().label("El estado"),
});

export const productReportQuery = Joi.object({
  category: Joi.string().trim().max(100).empty("").label("La categoría"),
});

// GET /api/products — filtros opcionales y paginación (solo si llegan page y limit)
export const productListQuery = Joi.object({
  search: Joi.string().trim().max(100).empty("").label("La búsqueda"),
  category: Joi.string().trim().max(100).empty("").label("La categoría"),
  isAvailable: Joi.boolean().label("El estado"),
  ...paginationFields,
});
