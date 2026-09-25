import { z } from "zod";
import { users as existingUsers } from "../data/users";

export function createEditUserSchema({ currentUserId }) {
  return z
    .object({
      userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),
      userName: z
        .string()
        .min(3, "El nombre debe tener mínimo 3 caracteres")
        .max(60, "El nombre es demasiado largo")
        .regex(/^[^\d]*$/, "El nombre no puede contener números"),
      address: z.string().min(1, "La dirección es requerida"),
      userPhone: z.string().regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos"),
      userEmail: z.string().min(1, "El correo es requerido").email("Debe ingresar un correo válido"),
      isActive: z.boolean(),
    })
    .refine(
      (data) =>
        !existingUsers.some(
          (u) => u.userEmail?.toLowerCase() === data.userEmail.toLowerCase() && u.id !== currentUserId
        ),
      { message: "Este correo ya está registrado", path: ["userEmail"] }
    );
}