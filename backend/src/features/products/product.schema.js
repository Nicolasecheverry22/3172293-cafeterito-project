// Validación de entrada del feature products (platillos del menú, RFADMIN20–24).
import { Joi, imageFields } from "../../utils/joi.js";
import { paginationFields } from "../../utils/listQuery.js";

const productFields = {
  productName: Joi.string().trim().min(2).max(120).required().label("El nombre"),
  category: Joi.string().trim().min(1).max(100).required().label("La categoría"),
  price: Joi.number().positive().precision(2).max(9999999999).required().label("El precio"),
  description: Joi.string().trim().max(500).empty("").allow(null).label("La descripción"),
  isAvailable: Joi.boolean().default(true).label("El estado"),
};

// POST /api/products — imagen opcional (data URL PNG/JPEG/WEBP, sin SVG) + miniatura
export const productSchema = Joi.object({
  ...productFields,
  ...imageFields("productImage", "La imagen"),
});

// PUT /api/products/:id — sin imagen nueva se conserva la actual; removeImage la quita
export const updateProductSchema = Joi.object({
  ...productFields,
  ...imageFields("productImage", "La imagen", { removable: true }),
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
