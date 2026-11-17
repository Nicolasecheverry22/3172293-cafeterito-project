// Validación de entrada del feature auth.
import { Joi, email } from "../../utils/joi.js";
import { passwordSchema } from "../users/user.schema.js";

export const loginSchema = Joi.object({
  email: email().required().label("El correo"),
  // Sin reglas de formato: solo se compara contra el hash (máx. para no hashear entradas enormes)
  password: Joi.string().min(1).max(128).required().label("La contraseña"),
});

export const forgotPasswordSchema = Joi.object({
  email: email().required().label("El correo"),
});

const resetCode = Joi.string()
  .trim()
  .pattern(/^\d{6}$/, { name: "debe tener exactamente 6 números" })
  .required()
  .label("El código");

export const verifyResetTokenSchema = Joi.object({
  email: email().required().label("El correo"),
  token: resetCode,
});

export const resetPasswordSchema = Joi.object({
  email: email().required().label("El correo"),
  token: resetCode,
  password: passwordSchema().required(),
});
