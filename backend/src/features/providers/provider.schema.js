// Validación de entrada del feature providers (RFADMIN14–17).
import { Joi, email, imageFields } from "../../utils/joi.js";
import { paginationFields } from "../../utils/listQuery.js";

// Sin Tarjeta de identidad (TI): un proveedor no puede ser menor de edad.
export const PROVIDER_DOCUMENT_TYPES = ["NIT", "CC", "CE", "PEP", "PPT"];

const providerFields = {
  documentType: Joi.string()
    .trim()
    .uppercase()
    .valid(...PROVIDER_DOCUMENT_TYPES)
    .default("NIT")
    .label("El tipo de documento"),
  // El NIT puede llevar dígito de verificación (900123456-7); los demás documentos son numéricos.
  nit: Joi.string()
    .trim()
    .when("documentType", {
      is: "NIT",
      then: Joi.string().pattern(/^\d{6,15}(-\d)?$/, {
        name: "debe tener entre 6 y 15 dígitos (opcionalmente con dígito de verificación: 900123456-7)",
      }),
      otherwise: Joi.string().pattern(/^\d{6,15}$/, { name: "debe ser numérico (6 a 15 dígitos)" }),
    })
    .required()
    .label("El número de documento"),
  providerName: Joi.string().trim().min(3).max(150).required().label("El nombre"),
  providerEmail: email().required().label("El correo"),
  providerPhone: Joi.string()
    .trim()
    .pattern(/^\d{7,15}$/, { name: "debe tener entre 7 y 15 dígitos" })
    .required()
    .label("El teléfono"),
  providerAddress: Joi.string().trim().max(255).empty("").allow(null).label("La dirección"),
  productService: Joi.string().trim().max(1000).empty("").allow(null).label("Los productos/servicios"),
  isActive: Joi.boolean().default(true).label("El estado"),
};

// POST /api/providers — logo opcional (PNG/JPEG/WEBP, sin SVG) + miniatura
export const providerSchema = Joi.object({
  ...providerFields,
  ...imageFields("providerImage", "El logo"),
});

// PUT /api/providers/:id — sin logo nuevo se conserva el actual; removeImage lo quita
export const updateProviderSchema = Joi.object({
  ...providerFields,
  ...imageFields("providerImage", "El logo", { removable: true }),
});

// PATCH /api/providers/:id/status
export const providerStatusSchema = Joi.object({
  isActive: Joi.boolean().required().label("El estado"),
});

export const providerReportQuery = Joi.object({
  nit: Joi.string().trim().max(30).empty("").label("El NIT"),
});

// GET /api/providers — filtros opcionales y paginación (solo si llegan page y limit)
export const providerListQuery = Joi.object({
  search: Joi.string().trim().max(100).empty("").label("La búsqueda"),
  nit: Joi.string().trim().max(30).empty("").label("El NIT"),
  documentType: Joi.string().trim().uppercase().valid(...PROVIDER_DOCUMENT_TYPES).empty("").label("El tipo de documento"),
  isActive: Joi.boolean().label("El estado"),
  ...paginationFields,
});
