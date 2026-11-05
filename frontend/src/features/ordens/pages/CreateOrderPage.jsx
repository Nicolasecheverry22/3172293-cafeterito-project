import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";

import OrderForm from "../components/OrderForm";
import { createOrder } from "@/services/orderApi";
import { getUsers } from "@/services/userApi";
import { getProducts } from "@/services/productApi";

import {
  showSuccessAlert,
  showSystemErrorAlert,
  showDeleteCancelAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  // Opciones reales: empleados activos y platillos disponibles
  const [waiters, setWaiters] = useState([]);
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    Promise.all([getUsers(), getProducts()])
      .then(([users, products]) => {
        setWaiters(
          users
            .filter((u) => u.is_active)
            .map((u) => ({ value: String(u.id), label: u.userName }))
        );
        setDishes(
          products
            .filter((p) => p.isAvailable)
            .map((p) => ({ value: String(p.id), label: p.productName, price: p.price }))
        );
      })
      .catch((error) => {
        console.error("Error cargando empleados/platillos:", error);
        showSystemErrorAlert({
          text: "No se pudieron cargar los empleados o el menú. Verifica que el backend esté corriendo.",
        });
      });
  }, []);

  const handleCreateOrder = async (validatedData) => {
    try {
      // Solo se envían ids y cantidades: el precio lo pone el backend desde la BD
      await createOrder({
        tableNumber: validatedData.tableNumber,
        waiterId: Number(validatedData.waiterId),
        observations: validatedData.observations ?? "",
        items: validatedData.items.map((item) => ({
          productId: Number(item.dishId),
          quantity: item.quantity,
        })),
      });

      await showSuccessAlert({
        title: "¡Orden creada!",
        text: "La orden fue registrada correctamente.",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error al crear la orden:", error);

      await showSystemErrorAlert({
        text: error.message || "La orden no pudo ser registrada correctamente.",
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
            waiters={waiters}
            dishes={dishes}
            onSubmit={handleCreateOrder}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
