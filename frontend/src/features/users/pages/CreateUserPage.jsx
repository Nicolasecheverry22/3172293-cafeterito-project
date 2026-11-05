import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import UserForm from "../components/UserForm";
import { Select } from "@/shared";
import { getDocumentTypes } from "@/services/selectService";
import { createUser } from "@/services/userApi";
import { getGroups } from "@/services/groupApi";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
    getGroups()
      .then((data) =>
        setGroups(data.map((g) => ({ value: g.group_id, label: g.group_name })))
      )
      .catch(() => setGroups([]));
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
      // Mapeo de los campos del formulario al contrato del backend (POST /api/users)
      const payload = {
        userName: validatedData.userName,
        userEmail: validatedData.userEmail,
        userPhone: validatedData.userPhone,
        userDocumentTypes: validatedData.userDocumentTypes,
        userDocumentNumber: validatedData.userDocumentNumber,
        userPassword: validatedData.userPassword,
        userAvatarUrl: null,
        isStaff: false,
        isActive: validatedData.isActive ?? true,
        isSuperuser: validatedData.isSuperUser ?? false,
        groupId: groupId || null,
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

  const handleCancel = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Estás seguro de cancelar?",
      text: "Los datos ingresados no se guardarán.",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Continuar registrando",
    });

    if (result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Registro cancelado",
        text: "No se guardó el usuario.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="bg-surface/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Registrar usuario
          </h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
          <div className="mb-6 max-w-sm">
            <Select
              label="Grupo (permisos)"
              name="groupId"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              options={groups}
            />
          </div>

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

