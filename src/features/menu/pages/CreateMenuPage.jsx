import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import Swal from "sweetalert2";

import { FormNavbar } from "@/shared";
import MenuForm from "../components/MenuForm";
import { menu as menuData } from "../data/menu";
import {
  showSuccessAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
} from "@/shared/services/alertService";

export default function CreateMenuPage() {
  const navigate = useNavigate();

  const handleCreateMenuItem = async (validatedData) => {
    try {
      const newItem = {
        id: menuData.length + 1,
        productName: validatedData.nombre,
        category: validatedData.categoria,
        price: validatedData.precio,
        isAvailable: validatedData.estado,
      };

      menuData.push(newItem);
      console.log("Platillo guardado:", newItem);

      await showSuccessAlert({
        title: "¡Platillo creado!",
        text: "El platillo fue registrado correctamente.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el platillo:", error);
      await showSystemErrorAlert({
        text: "El platillo no pudo ser registrado correctamente.",
      });
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "¿Cancelar registro?",
      text: "Los datos ingresados no se guardarán.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
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
        text: "No se guardó el nuevo platillo.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      <FormNavbar />
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <UtensilsCrossed className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
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