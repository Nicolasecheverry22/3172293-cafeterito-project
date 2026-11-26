// Validación de entrada del feature users (RFADMIN02–05, RNF10).
import { Joi, email, imageFields } from "../../utils/joi.js";
import { paginationFields } from "../../utils/listQuery.js";
import { PASSWORD_MIN, PASSWORD_MAX, PASSWORD_RULES } from "../../utils/passwordPolicy.js";

// Letras (con tildes y ñ) y espacios
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;

export const passwordSchema = () =>
  PASSWORD_RULES.reduce(
    (schema, rule) => schema.pattern(rule.regex, { name: rule.message }),
    Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX)
  ).label("La contraseña");

const userFields = {
  userName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(NAME_REGEX, { name: "solo puede contener letras y espacios" })
    .required()
    .label("El nombre"),
  userEmail: email().required().label("El correo"),
  userPersonalEmail: email()
    .invalid(Joi.ref("userEmail"))
    .empty("")
    .allow(null)
    .label("El correo personal")
    .messages({ "any.invalid": "{{#label}} debe ser distinto del correo empresarial" }),
  userPhone: Joi.string()
    .trim()
    .pattern(/^\d{7,15}$/, { name: "debe tener entre 7 y 15 dígitos" })
    .required()
    .label("El teléfono"),
  userDocumentTypes: Joi.string().trim().min(1).max(20).required().label("El tipo de documento"),
  userDocumentNumber: Joi.string()
    .trim()
    .pattern(/^\d{1,15}$/, { name: "debe ser numérico y tener máximo 15 dígitos" })
    .required()
    .label("El número de documento"),
  userAddress: Joi.string().trim().min(10).max(100).empty("").allow(null).label("La dirección"),
  groupNames: Joi.array()
    .items(Joi.string().trim().min(1).max(100))
    .min(1)
    .unique()
    .required()
    .label("Los tipos de usuario")
    .messages({ "array.min": "Debe seleccionar al menos un tipo de usuario" }),
};

// POST /api/users — isSuperuser/isStaff/isActive no se aceptan (stripUnknown los elimina)
// Foto de perfil opcional (RFADMIN02): PNG/JPEG/WEBP, sin SVG, ≤ 2 MB comprimida.
export const createUserSchema = Joi.object({
  ...userFields,
  ...imageFields("userImage", "La foto de perfil"),
  userPassword: passwordSchema().required(),
  // Autorización de tratamiento de datos personales (Ley 1581 de 2012): obligatoria y true.
  // Solo al crear; el PUT no la acepta (stripUnknown) y /me la prohíbe.
  dataConsent: Joi.boolean()
    .valid(true)
    .required()
    .label("La autorización de datos")
    .messages({
      "any.required": "Debe aceptarse la política de tratamiento de datos personales",
      "any.only": "Debe aceptarse la política de tratamiento de datos personales",
      "boolean.base": "Debe aceptarse la política de tratamiento de datos personales",
    }),
});

// PUT /api/users/:id — la contraseña no se cambia aquí; removeImage quita la foto
export const updateUserSchema = Joi.object({
  ...userFields,
  ...imageFields("userImage", "La foto de perfil", { removable: true }),
  isActive: Joi.boolean().label("El estado"),
});

// PATCH /api/users/:id/status
export const userStatusSchema = Joi.object({
  isActive: Joi.boolean().required().label("El estado"),
});

export const userReportQuery = Joi.object({
  document: Joi.string().trim().pattern(/^\d{1,15}$/).empty("").label("El documento"),
});

// GET /api/users — filtros opcionales y paginación (solo si llegan page y limit)
export const userListQuery = Joi.object({
  search: Joi.string().trim().max(100).empty("").label("La búsqueda"),
  isActive: Joi.boolean().label("El estado"),
  ...paginationFields,
});

// ── Mi perfil (/api/users/me) ───────────────────────────────────────────
// Solo datos personales. Los campos administrativos (correo de acceso, documento, rol,
// estado, flags, fechas laborales) los cambia un administrador: si llegan → 400.
// No basta con stripUnknown: se declaran prohibidos para responder el error explícito.
const NOT_EDITABLE = "No puedes modificar este campo";
const FORBIDDEN_PROFILE_FIELDS = [
  "groupNames", "groups", "isActive", "is_active", "isSuperuser", "is_superuser",
  "isStaff", "is_staff", "userEmail", "userDocumentTypes", "userDocumentNumber",
  "userDocument", "userPassword", "hireDate", "startDate", "endDate", "createdAt",
  "dataConsent", "dataConsentAt", "dataPolicyUrl",
];

export const updateMeSchema = Joi.object({
  userName: userFields.userName,
  userPhone: userFields.userPhone,
  userAddress: userFields.userAddress,
  userPersonalEmail: email().empty("").allow(null).label("El correo personal"),
  ...imageFields("userImage", "La foto de perfil", { removable: true }),
  ...Object.fromEntries(
    FORBIDDEN_PROFILE_FIELDS.map((key) => [
      key,
      Joi.any().forbidden().messages({ "any.unknown": `${NOT_EDITABLE} (${key})` }),
    ])
  ),
});

// PUT /api/users/me/password — política RNF10 para la nueva
export const changeMyPasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required().label("La contraseña actual"),
  newPassword: passwordSchema().required().label("La nueva contraseña"),
});
