import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import InventoryForm from "../components/InventoryForm";
import { getCategoryTypes } from "@/services/selectService";
import { inventory as inventoryData } from "../data/inventory";

import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function CreateInventoryPage() {
  const navigate = useNavigate();
  const [categoryTypes, setCategoryTypes] = useState([]);

  useEffect(() => {
    getCategoryTypes().then(setCategoryTypes).catch(() => setCategoryTypes([]));
  }, []);

  const handleCreateProvision = async (validatedData) => {
    if (!validatedData || Object.keys(validatedData).length === 0) {
      await showCreateErrorAlert({
        entity: "suministro",
        text: "Por favor completa todos los campos requeridos antes de registrar el suministro.",
      });
      return;
    }

    try {
      const newProvision = { id: inventoryData.length + 1, ...validatedData };
      inventoryData.push(newProvision);

      await showSuccessAlert({
        title: "¡Suministro creado!",
        text: "El suministro fue registrado correctamente.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el suministro:", error);
      await showSystemErrorAlert({
        text: "Ocurrió un error inesperado al intentar registrar el suministro.",
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
        text: "No se guardó el suministro.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="bg-surface/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <PackagePlus className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Registrar suministro
          </h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
          <InventoryForm
            mode="create"
            categoryTypes={categoryTypes}
            onSubmit={handleCreateProvision}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

