import { z } from "zod";
import { imageFilesField } from "@/shared/utils/image";

// La unicidad de correo/documento la valida la BD (UNIQUE) y el backend responde 409.
// Formatos alineados con el backend (user.schema.js).
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;
export function createEditUserSchema() {
  return z.object({
    userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),
    userDocumentNumber: z
      .string()
      .regex(/^\d{1,15}$/, "El documento debe ser numérico y tener máximo 15 dígitos"),
    userName: z
      .string()
      .trim()
      .min(3, "El nombre debe tener mínimo 3 caracteres")
      .max(100, "El nombre es demasiado largo")
      .regex(NAME_REGEX, "El nombre solo puede contener letras y espacios"),
    userPhone: z.string().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos"),
    userEmail: z.string().min(1, "El correo es requerido").email("Debe ingresar un correo válido"),
    groupNames: z.array(z.string()).min(1, "Debe seleccionar al menos un tipo de usuario"),
    isActive: z.boolean(),
    userImage: imageFilesField(),
  });
}
