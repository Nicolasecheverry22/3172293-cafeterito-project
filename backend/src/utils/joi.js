
import BaseJoi from "joi";

const messages = {
  "any.required": "{{#label}} es obligatorio",
  "any.only": "{{#label}} debe ser uno de: {{#valids}}",
  "any.invalid": "{{#label}} no es válido",
  "any.unknown": "{{#label}} no está permitido",
  "string.base": "{{#label}} debe ser texto",
  "string.empty": "{{#label}} no puede estar vacío",
  "string.min": "{{#label}} debe tener al menos {{#limit}} caracteres",
  "string.max": "{{#label}} debe tener máximo {{#limit}} caracteres",
  "string.email": "{{#label}} debe ser un correo electrónico válido",
  "string.pattern.base": "{{#label}} tiene un formato inválido",
  "string.pattern.name": "{{#label}} {{#name}}",
  "number.base": "{{#label}} debe ser un número",
  "number.integer": "{{#label}} debe ser un número entero",
  "number.min": "{{#label}} debe ser mayor o igual a {{#limit}}",
  "number.max": "{{#label}} debe ser menor o igual a {{#limit}}",
  "number.positive": "{{#label}} debe ser mayor que 0",
  "number.precision": "{{#label}} admite máximo {{#limit}} decimales",
  "number.unsafe": "{{#label}} está fuera del rango permitido",
  "boolean.base": "{{#label}} debe ser verdadero o falso",
  "array.base": "{{#label}} debe ser una lista",
  "array.min": "{{#label}} debe tener al menos {{#limit}} elemento(s)",
  "array.unique": "{{#label}} contiene valores repetidos",
  "object.base": "{{#label}} debe ser un objeto",
  "date.base": "{{#label}} debe ser una fecha válida",
};

export const Joi = BaseJoi.defaults((schema) =>
  schema.options({ messages, errors: { wrap: { label: false } } })
);

// ── Reglas reutilizables ────────────────────────────────────────
export const idParam = Joi.object({
  id: Joi.number().integer().positive().required().label("El id"),
});

// Fecha AAAA-MM-DD validada como fecha real (se guarda como texto para evitar
// desfases de zona horaria al convertir a Date).
export const isoDate = () =>
  Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/, { name: "debe tener formato AAAA-MM-DD" })
    .custom((value, helpers) => {
      const d = new Date(`${value}T00:00:00Z`);
      return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value
        ? helpers.message("{{#label}} no es una fecha válida")
        : value;
    });

export const email = () => Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(150);

// ── Imágenes (data URL base64) ──────────────────────────────────
// Solo PNG, JPEG y WEBP: NO se acepta SVG (puede llevar <script> → XSS al mostrarse).
// El frontend redimensiona a ≈ 800 px y genera una miniatura de 96×96 antes de enviar.
const IMAGE_DATA_URI = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
export const IMAGE_MAX_LENGTH = 1_500_000; // ≈ 1.1 MB binarios (2 MB de entrada ya comprimida)
export const THUMB_MAX_LENGTH = 50_000;    // ≈ 37 KB binarios (96×96 ocupa ~3–8 KB)

const imageDataUri = (max) =>
  Joi.string()
    .max(max)
    .pattern(IMAGE_DATA_URI, { name: "debe ser una imagen PNG, JPG o WEBP codificada en base64" })
    .messages({
      "string.max": "{{#label}} es demasiado grande (máximo 2 MB)",
      "any.required": "{{#label}} es un campo obligatorio",
    });

/**
 * Campos de imagen de un recurso: <key>, <key>Thumb y, si se permite quitarla, removeImage.
 * - required: la imagen es obligatoria (p. ej. insumo al crear, RFADMIN08).
 * - removable: acepta removeImage=true para borrar la imagen guardada (solo en PUT).
 * La miniatura es obligatoria cuando llega la imagen.
 */
export const imageFields = (key, label, { required = false, removable = false } = {}) => {
  const image = imageDataUri(IMAGE_MAX_LENGTH).empty("").allow(null).label(label);
  const thumb = imageDataUri(THUMB_MAX_LENGTH).empty("").allow(null).label(`La miniatura de ${label.toLowerCase()}`);
  return {
    [key]: required ? image.required() : image,
    [`${key}Thumb`]: Joi.when(key, {
      is: Joi.string().required(),
      then: thumb.required(),
      otherwise: thumb,
    }),
    ...(removable && { removeImage: Joi.boolean().default(false).label("Quitar imagen") }),
  };
};
