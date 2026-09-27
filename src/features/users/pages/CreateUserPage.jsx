import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import { FormNavbar } from "@/shared";
import UserForm from "../components/UserForm";
import { getDocumentTypes } from "@/services/selectService";
import { users as usersData } from "../data/users";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
} from "@/shared/services/alertService";

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
      const newUser = { id: usersData.length + 1, ...validatedData };
      usersData.push(newUser);
      console.log("Usuario creado:", newUser);

      
      await showSuccessAlert({
        title: "¡Usuario creado!",
        text: "El usuario fue registrado correctamente.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      await showSystemErrorAlert({
        text: "Ocurrió un error inesperado al intentar registrar el usuario.",
      });
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro de cancelar?",
      text: "Los datos ingresados no se guardarán.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Continuar editando",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        title: "!text-amber-600 font-bold",
        confirmButton:
          "!bg-red-600 hover:!bg-red-700 text-white cursor-pointer px-4 py-2 rounded-lg ml-2 font-medium",
        cancelButton:
          "!bg-gray-500 hover:!bg-gray-600 text-white cursor-pointer px-4 py-2 rounded-lg font-medium",
      },
      buttonsStyling: false,
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
    <div className="w-full min-h-screen bg-background pb-10">
      <FormNavbar />
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Registrar usuario
          </h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
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