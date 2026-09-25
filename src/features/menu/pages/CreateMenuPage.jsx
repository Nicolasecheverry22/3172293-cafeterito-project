import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";
import { FormNavbar } from "@/shared";
import MenuForm from "../components/MenuForm";
import { menu as menuData } from "../data/menu";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmDeleteAlert,
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
        title: "Platillo creado",
        text: "El platillo fue creado correctamente.",
        timer: 2000,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el platillo:", error);

      await showErrorAlert({
        title: "Error al crear el platillo",
        text: "El platillo no pudo ser creado correctamente.",
      });
    }
  };

  const handleCancel = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Cancelar registro?",
      text: "Los datos ingresados no se guardarán.",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar editando",
    });

    if (result.isConfirmed) {
      navigate(-1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background pb-12">
      <FormNavbar />

      <div className="w-full px-6 md:px-12 pt-10">
        <div className="mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Utensils className="w-10 h-10 text-text-primary" />

            <h1 className="text-display font-heading font-bold text-text-primary">
              Registrar nuevo platillo
            </h1>
          </div>

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
