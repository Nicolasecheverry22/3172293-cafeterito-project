import { z } from "zod";
import { fileSchema } from "../schemas/fileSchema";
import { users as existingUsers } from "../data/users";

const NAME_NO_DIGITS_REGEX = /^[^\d]*$/;

export function createUserSchema({ currentUserId = null } = {}) {
  return z
    .object({
      userName: z
        .string()
        .min(3, "El nombre debe tener mínimo 3 caracteres")
        .max(60, "El nombre es demasiado largo")
        .regex(NAME_NO_DIGITS_REGEX, "El nombre no puede contener números"),

      userEmail: z.string().min(1, "El correo es requerido").email("Debe ingresar un correo válido"),

      userPhone: z.string().regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos"),

      userImage: fileSchema.shape.files.optional(),

      userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),

      userDocumentNumber: z
        .string()
        .min(5, "Número de documento inválido")
        .max(20, "Número de documento demasiado largo"),

      userPassword: z
        .string()
        .min(8, "La contraseña debe tener mínimo 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

      isActive: z.boolean(),
      isSuperUser: z.boolean(),
      isCook: z.boolean(),
      isWaiter: z.boolean(),
      isCashier: z.boolean(),
      isGuest: z.boolean(),

      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })

    // 1. Validar unificación de Correo (Existente)
    .refine(
      (data) =>
        !existingUsers.some(
          (user) =>
            user.userEmail?.toLowerCase() === data.userEmail?.toLowerCase() &&
            user.id !== currentUserId
        ),
      { message: "Este correo ya está registrado", path: ["userEmail"] }
    )

    // 2. Validar unificación de Número de Documento (NUEVO)
    .refine(
      (data) =>
        !existingUsers.some((user) => {
          const docInUser = user.userDocumentNumber || user.userDocument || user.documentNumber;
          return (
            docInUser?.toString().trim() === data.userDocumentNumber?.toString().trim() &&
            user.id !== currentUserId
          );
        }),
      { message: "Este número de documento ya está registrado", path: ["userDocumentNumber"] }
    )

    // 3. Validar unificación de Teléfono (NUEVO)
    .refine(
      (data) =>
        !existingUsers.some(
          (user) =>
            user.userPhone?.toString().trim() === data.userPhone?.toString().trim() &&
            user.id !== currentUserId
        ),
      { message: "Este número de teléfono ya está registrado", path: ["userPhone"] }
    )

    // 4. Validar Selección de Roles
    .refine(
      (data) => data.isSuperUser || data.isCook || data.isWaiter || data.isCashier || data.isGuest,
      { message: "Debe seleccionar al menos un rol", path: ["isSuperUser"] }
    )

    // 5. Fechas obligatorias para roles no administradores
    .refine((data) => data.isSuperUser || Boolean(data.startDate), {
      message: "Debe ingresar la fecha de inicio para roles distintos de administrador",
      path: ["startDate"],
    })
    
}

export const userSchema = createUserSchema();