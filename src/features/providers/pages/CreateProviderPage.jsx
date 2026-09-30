import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import Swal from "sweetalert2";
import ProviderForm from "../components/ProviderForm";
import { getDocumentTypes } from "@/services/selectService";
import { providers as providersData } from "../data/providers";

import {
  showSuccessAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
} from "@/shared/services/alertService";

export default function CreateProviderPage() {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes).catch(() => setDocumentTypes([]));
  }, []);

  const handleCreateProvider = async (validatedData) => {
    try {
      const newProvider = { id: providersData.length + 1, ...validatedData };
      providersData.push(newProvider);
      console.log("Proveedor guardado:", newProvider);

      await showSuccessAlert({
        title: "¡Proveedor creado!",
        text: "El proveedor fue registrado correctamente.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el Proveedor:", error);
      await showSystemErrorAlert({
        text: "Ocurrió un error inesperado al intentar registrar el proveedor.",
      });
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "¿Cancelar registro?",
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
        text: "No se guardó el proveedor.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Registrar proveedor nuevo
          </h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
          <ProviderForm
            mode="create"
            documentTypes={documentTypes}
            onSubmit={handleCreateProvider}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}