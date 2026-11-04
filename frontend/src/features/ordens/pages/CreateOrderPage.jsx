import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";


import OrderForm from "../components/OrderForm";
import { waitersData, menuDishesData } from "../data/orderMockData";
import { ordens as ordersData } from "../data/ordens";

import {
  showSuccessAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const handleCreateOrder = async (validatedData) => {
    try {
    const waiterName =
    waitersData.find((w) => w.value === validatedData.waiterId)?.label ?? "";

    const newOrder = {
    id: ordersData.length + 1,
    tableNumber: validatedData.tableNumber,
    waiter: waiterName,
    status: "Activa",
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

  await showSuccessAlert({
    title: "¡Orden creada!",
    text: "La orden fue registrada correctamente.",
  });

  navigate(-1);
} catch (error) {
      console.error("Error al crear la orden:", error);

      await showSystemErrorAlert({
        text: "La orden no pudo ser registrada correctamente.",
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
      showDeleteCancelAlert({
        title: "Registro cancelado",
        text: "No se guardó la nueva orden.",
      });
      navigate(-1);
    }
  };

  return (
    <div className="bg-surface/60 rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">

      <div className="max-w-3xl mx-auto space-y-8 p-4">
        <div className="flex items-center gap-3">
          <Utensils className="w-8 h-8 text-text-primary" />

          <h1 className="text-title font-heading font-bold text-text-primary">
            Registrar orden nueva
          </h1>
        </div>

        <div className="bg-surface/70 rounded-3xl p-8 shadow-sm">
          <OrderForm
            mode="create"
            onSubmit={handleCreateOrder}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}