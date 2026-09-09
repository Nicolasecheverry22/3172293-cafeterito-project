import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategoryTypes } from "@/services/selectService";
import { FormNavbar } from "@/shared";
import InventoryForm from "../components/InventoryForm";
import { inventory as inventoryData } from "../data/inventory";

export default function CreateInventoryPage() {
  const navigate = useNavigate();
  const [categoryTypes, setCategoryTypes] = useState([]);

  useEffect(() => {
    getCategoryTypes().then(setCategoryTypes);
  }, []);

  const handleCreateProduct = async (validatedData) => {
    inventoryData.push(validatedData);
    console.log("Inventario guardado:", inventoryData);
    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      <FormNavbar />
      <div className="w-full max-w-6xl mx-auto p-4">
        <h1 className="text-main font-heading text-text-primary mb-8 font-bold">Crear Producto</h1>

        <div className="bg-surface-muted border border-border p-8 rounded-2xl shadow-sm">
          <InventoryForm
            mode="create"
            categoryTypes={categoryTypes}
            onSubmit={handleCreateProduct}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  );
}