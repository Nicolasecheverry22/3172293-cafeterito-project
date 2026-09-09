import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";
import { FormNavbar } from "@/shared";
import MenuForm from "../components/MenuForm";
import { menu as menuData } from "../data/menu";

export default function CreateMenuPage() {
  const navigate = useNavigate();

  const handleCreateMenuItem = async (validatedData) => {
    const newItem = { id: menuData.length + 1, ...validatedData };
    menuData.push(newItem);
    console.log("Platillo guardado:", newItem);
    navigate(-1);
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

          <MenuForm mode="create" onSubmit={handleCreateMenuItem} onCancel={() => navigate(-1)} />
        </div>
      </div>
    </div>
  );
}