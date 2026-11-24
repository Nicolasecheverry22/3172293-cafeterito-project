import { z } from "zod";
import { imageFilesField } from "@/shared/utils/image";
import { users as existingUsers } from "../data/users";

// Alineado con el backend (user.schema.js): letras (con tildes y ñ) y espacios
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;

export function createUserSchema({ currentUserId = null } = {}) {
  return z
    .object({
      userName: z
        .string()
        .trim()
        .min(3, "El nombre debe tener mínimo 3 caracteres")
        .max(100, "El nombre es demasiado largo")
        .regex(NAME_REGEX, "El nombre solo puede contener letras y espacios"),

      userEmail: z.string().min(1, "El correo es requerido").email("Debe ingresar un correo válido"),

      userPhone: z.string().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos"),

      // Opcional; si se ingresa: 10–100 caracteres (RFADMIN02)
      address: z
        .string()
        .trim()
        .refine((v) => v === "" || (v.length >= 10 && v.length <= 100), {
          message: "La dirección debe tener entre 10 y 100 caracteres",
        })
        .optional(),

      // Foto de perfil opcional (RFADMIN02): PNG/JPG/WEBP, máx. 2 MB (igual que Joi)
      userImage: imageFilesField(),

      userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),

      userDocumentNumber: z
        .string()
        .regex(/^\d{1,15}$/, "El documento debe ser numérico y tener máximo 15 dígitos"),

      // RNF10: 10–64 caracteres, mayúscula, minúscula, número y símbolo
      userPassword: z
        .string()
        .min(10, "La contraseña debe tener mínimo 10 caracteres")
        .max(64, "La contraseña debe tener máximo 64 caracteres")
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