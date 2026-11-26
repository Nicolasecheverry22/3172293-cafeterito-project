import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import UserForm from "../components/UserForm";
import { getDocumentTypes } from "@/services/selectService";
import { createUser } from "@/services/userApi";
import { buildImagePayload } from "@/shared/utils/image";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";
import { confirmDiscardChanges } from "@/shared/services/confirmAction";

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
  }, []);

  const handleCreateUser = async (validatedData) => {
    // Validar si los campos obligatorios están presentes
    if (!validatedData || Object.keys(validatedData).length === 0) {
      await showCreateErrorAlert({
        entity: "usuario",
        text: "Por favor completa todos los campos requeridos antes de registrar el usuario.",
      });
      return;
    }

    try {
      // Foto opcional: imagen comprimida + miniatura (base64)
      const imageFields = await buildImagePayload("userImage", validatedData.userImage);

      // Mapeo de los campos del formulario al contrato del backend (POST /api/users)
      const payload = {
        userName: validatedData.userName,
        userEmail: validatedData.userEmail,
        userPhone: validatedData.userPhone,
        userDocumentTypes: validatedData.userDocumentTypes,
        userDocumentNumber: validatedData.userDocumentNumber,
        userPassword: validatedData.userPassword,
        userAddress: validatedData.address || null,
        ...imageFields,
        // isSuperuser/isStaff/isActive NO se envían: el backend los calcula
        // (Administrador = superusuario; todo usuario nuevo queda activo).
        // Los checkboxes de "Tipo de Usuario" definen los grupos (y con ellos los permisos)
        groupNames: validatedData.groupNames ?? [],
        // Autorización de tratamiento de datos: el formulario no deja enviar sin marcarla
        dataConsent: true,
      };

      await createUser(payload);

      await showSuccessAlert({
        title: "¡Usuario creado!",
        text: "El usuario fue registrado correctamente en la base de datos.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      await showSystemErrorAlert({
        text:
          error.message ||
          "Ocurrió un error inesperado al intentar registrar el usuario.",
      });
    }
  };

  // Sin cambios sale directo; con datos ingresados pide confirmación "warning"
  const handleCancel = async (isDirty) => {
    const canLeave = await confirmDiscardChanges({
      isDirty,
      title: "¿Salir sin registrar el usuario?",
      text: "Los datos ingresados no se guardarán.",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Seguir registrando",
    });
    if (canLeave) navigate(-1);
  };

  return (
    <div className="bg-surface/70 dark:bg-surface/90 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Registrar usuario
          </h1>
        </div>

        <div className="bg-surface rounded-shape-xl p-4 sm:p-6 md:p-8 shadow-elevation-1">
          <UserForm
            mode="create"
            documentTypes={documentTypes}
            onSubmit={handleCreateUser}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
