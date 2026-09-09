import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";
import { FormNavbar } from "@/shared";
import OrderForm from "../components/OrderForm";
import { waitersData, menuDishesData } from "../data/orderMockData";
import { ordens as ordersData } from "../data/ordens";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const handleCreateOrder = async (validatedData) => {
    const waiterName = waitersData.find((w) => w.value === validatedData.waiterId)?.label ?? "";

    const newOrder = {
      id: ordersData.length + 1,
      tableNumber: validatedData.tableNumber,
      waiter: waiterName,
      status: "pending", 
      createdAt: new Date().toISOString().slice(0, 10),
      observations: validatedData.observations ?? "",
      items: validatedData.items.map((item) => {
        const dish = menuDishesData.find((d) => d.value === item.dishId);
        return {
          dish: dish?.label ?? "",
          quantity: item.quantity,
          price: dish?.price ?? 0,
          dispatched: false,
        };
      }),
    };


    ordersData.push(newOrder);
    console.log("Orden creada:", newOrder);
    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      <FormNavbar />
      <div className="max-w-3xl mx-auto space-y-8 p-4">
        <div className="flex items-center gap-3">
          <Utensils className="w-8 h-8 text-text-primary" />
          <h1 className="text-title font-heading font-bold text-text-primary">Registrar orden nueva</h1>
        </div>

        <div className="bg-background p-6 md:p-8 rounded-2xl border border-border shadow-sm">
          <OrderForm mode="create" onSubmit={handleCreateOrder} onCancel={() => navigate(-1)} />
        </div>
      </div>
    </div>
  );
}