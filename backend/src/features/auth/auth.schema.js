// Validación de entrada del feature auth.
import { Joi, email } from "../../utils/joi.js";

export const loginSchema = Joi.object({
  email: email().required().label("El correo"),
  // Sin reglas de formato: solo se compara contra el hash (máx. para no hashear entradas enormes)
  password: Joi.string().min(1).max(128).required().label("La contraseña"),
});
