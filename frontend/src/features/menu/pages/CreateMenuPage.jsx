import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import MenuForm from "../components/MenuForm";
import { createProduct } from "@/services/productApi";
import { buildImagePayload } from "@/shared/utils/image";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";
import { confirmDiscardChanges } from "@/shared/services/confirmAction";

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
      // Imagen comprimida (≈ 800 px) + miniatura 96×96, en base64 para la BD.
      const imageFields = await buildImagePayload("productImage", validatedData.imagen);

      await createProduct({
        productName: validatedData.nombre,
        category: validatedData.categoria,
        price: Number(validatedData.precio),
        description: validatedData.descripcion,
        isAvailable: validatedData.estado ?? true,
        ...imageFields,
      });

      await showSuccessAlert({
        title: "¡Platillo creado!",
        text: "El platillo fue registrado correctamente en la base de datos.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el platillo:", error);
      await showSystemErrorAlert({
        text: error.message || "Ocurrió un error inesperado al intentar registrar el platillo.",
      });
    }
  };

  // Sin cambios sale directo; con datos ingresados pide confirmación "warning"
  const handleCancel = async (isDirty) => {
    const canLeave = await confirmDiscardChanges({
      isDirty,
      title: "¿Salir sin registrar el platillo?",
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
          <UtensilsCrossed className="w-8 h-8 text-text-primary" />
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Registrar platillo nuevo
          </h1>
        </div>

        <div className="bg-surface rounded-shape-xl p-4 sm:p-6 md:p-8 shadow-elevation-1">
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