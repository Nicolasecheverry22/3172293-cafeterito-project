// Validación de entrada del feature inventory (suministros, RFADMIN08–12).
import { Joi, isoDate, imageFields } from "../../utils/joi.js";
import { paginationFields } from "../../utils/listQuery.js";

export const INVENTORY_STATUSES = ["Disponible", "Vencido", "Avería", "Agotado"];

const inventoryFields = {
  provisionName: Joi.string().trim().min(2).max(120).required().label("El nombre"),
  category: Joi.string().trim().min(1).max(100).required().label("La categoría"),
  unit: Joi.string().trim().min(1).max(20).required().label("La unidad"),
  stock: Joi.number().integer().min(0).required().label("El stock"),
  price: Joi.number().positive().precision(2).max(9999999999).required().label("El precio"),
  batch: Joi.string()
    .trim()
    .max(50)
    .pattern(/^[0-9A-Za-z-]+$/, { name: "solo puede contener letras, números y guiones" })
    .required()
    .label("El lote"),
  minStock: Joi.number().integer().min(0).required().label("El stock mínimo"),
  maxStock: Joi.number()
    .integer()
    .min(Joi.ref("minStock"))
    .required()
    .label("El stock máximo")
    .messages({ "number.min": "{{#label}} no puede ser inferior al stock mínimo" }),
  status: Joi.string().trim().valid(...INVENTORY_STATUSES).required().label("El estado"),
  barcode: Joi.string()
    .trim()
    .max(50)
    .pattern(/^[0-9A-Za-z-]+$/, { name: "solo puede contener letras, números y guiones" })
    .required()
    .label("El código de barras"),
  expirationDate: isoDate().empty("").allow(null).label("La fecha de vencimiento"),
  providerId: Joi.number().integer().positive().empty("").allow(null).label("El proveedor"),
};

// POST /api/inventory — la imagen del insumo es obligatoria (RFADMIN08)
export const inventorySchema = Joi.object({
  ...inventoryFields,
  ...imageFields("provisionImage", "La imagen del insumo", { required: true }),
});

// PUT /api/inventory/:id — sin imagen nueva se conserva la actual. No se permite
// quitarla (removeImage) porque el insumo siempre debe tener imagen.
export const updateInventorySchema = Joi.object({
  ...inventoryFields,
  ...imageFields("provisionImage", "La imagen del insumo"),
});

// PATCH /api/inventory/:id/status
export const inventoryStatusSchema = Joi.object({
  status: Joi.string().trim().valid(...INVENTORY_STATUSES).required().label("El estado"),
});

export const inventoryReportQuery = Joi.object({
  category: Joi.string().trim().max(100).empty("").label("La categoría"),
  status: Joi.string().trim().max(30).empty("").label("El estado"),
});

// GET /api/inventory — filtros opcionales y paginación (solo si llegan page y limit)
export const inventoryListQuery = Joi.object({
  search: Joi.string().trim().max(100).empty("").label("La búsqueda"),
  category: Joi.string().trim().max(100).empty("").label("La categoría"),
  status: Joi.string().trim().valid(...INVENTORY_STATUSES).empty("").label("El estado"),
  providerId: Joi.number().integer().positive().empty("").label("El proveedor"),
  ...paginationFields,
});
