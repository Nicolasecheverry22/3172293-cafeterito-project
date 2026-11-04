import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import MenuForm from "../components/MenuForm";
import { menu as menuData } from "../data/menu";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function CreateMenuPage() {
  const navigate = useNavigate();

  const handleCreateMenuItem = async (validatedData) => {
    if (!validatedData || Object.keys(validatedData).length === 0) {
      await showCreateErrorAlert({
        entity: "platillo",
        text: "Por favor completa todos los campos requeridos antes de registrar el platillo.",
      });
      return;
    }

    try {
      const newItem = {
        id: menuData.length + 1,
        productName: validatedData.nombre,
        category: validatedData.categoria,
        price: Number(validatedData.precio),
        description: validatedData.descripcion,
        isAvailable: validatedData.estado ?? true,
        productImage: validatedData.imagen,
      };

      menuData.push(newItem);

      await showSuccessAlert({
        title: "¡Platillo creado!",
        text: "El platillo fue registrado correctamente.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el platillo:", error);
      await showSystemErrorAlert({
        text: "Ocurrió un error inesperado al intentar registrar el platillo.",
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
        text: "No se guardó el platillo.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="bg-surface/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <UtensilsCrossed className="w-8 h-8 text-text-primary" />
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Registrar platillo nuevo
          </h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
          <MenuForm
            mode="create"
            onSubmit={handleCreateMenuItem}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}