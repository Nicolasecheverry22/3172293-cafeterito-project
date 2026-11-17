
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
