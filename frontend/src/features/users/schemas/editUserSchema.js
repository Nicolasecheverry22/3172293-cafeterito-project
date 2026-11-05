import { z } from "zod";

// La unicidad de correo/documento la valida la BD (UNIQUE) y el backend responde 409.
export function createEditUserSchema() {
  return z.object({
    userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),
    userDocumentNumber: z
      .string()
      .min(5, "Número de documento inválido")
      .max(20, "Número de documento demasiado largo"),
    userName: z
      .string()
      .min(3, "El nombre debe tener mínimo 3 caracteres")
      .max(60, "El nombre es demasiado largo")
      .regex(/^[^\d]*$/, "El nombre no puede contener números"),
    userPhone: z.string().regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos"),
    userEmail: z.string().min(1, "El correo es requerido").email("Debe ingresar un correo válido"),
    groupNames: z.array(z.string()).min(1, "Debe seleccionar al menos un tipo de usuario"),
    isActive: z.boolean(),
  });
}
