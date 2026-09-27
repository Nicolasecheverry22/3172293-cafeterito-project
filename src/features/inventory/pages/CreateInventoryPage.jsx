import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import Swal from "sweetalert2";

import { FormNavbar } from "@/shared";
import InventoryForm from "../components/InventoryForm";
import { getCategoryTypes } from "@/services/selectService";
import { inventory as inventoryData } from "../data/inventory";

import {
  showSuccessAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
} from "@/shared/services/alertService";

export default function CreateInventoryPage() {
  const navigate = useNavigate();
  const [categoryTypes, setCategoryTypes] = useState([]);

  useEffect(() => {
    getCategoryTypes().then(setCategoryTypes).catch(() => setCategoryTypes([]));
  }, []);

  const handleCreateProduct = async (validatedData) => {
    try {
      const newProduct = { id: inventoryData.length + 1, ...validatedData };
      inventoryData.push(newProduct);
      console.log("Producto guardado:", newProduct);

      await showSuccessAlert({
        title: "¡Producto creado!",
        text: "El producto fue registrado correctamente.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear el producto:", error);
      await showSystemErrorAlert({
        text: "El producto no pudo ser registrado correctamente.",
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
        text: "No se guardó el producto.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      <FormNavbar />
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <PackagePlus className="w-8 h-8 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Registrar producto nuevo
          </h1>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-sm">
          <InventoryForm
            mode="create"
            categoryTypes={categoryTypes}
            onSubmit={handleCreateProduct}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}