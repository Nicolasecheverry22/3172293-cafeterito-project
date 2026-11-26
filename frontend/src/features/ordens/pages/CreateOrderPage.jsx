import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";

import OrderComposer from "../components/OrderComposer";
import { createOrder } from "@/services/orderApi";
import { getProducts } from "@/services/productApi";

import {
  showSuccessAlert,
  showSystemErrorAlert,
} from "@/shared/services/alertService";
import { confirmDiscardChanges } from "@/shared/services/confirmAction";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);

  // Ya no se cargan usuarios: un mesero sin permiso list_user recibía error al abrir esta pantalla
  useEffect(() => {
    getProducts()
      .then((products) => setDishes(products.filter((p) => p.isAvailable)))
      .catch((error) => {
        console.error("Error cargando el menú:", error);
        showSystemErrorAlert({
          text: "No se pudo cargar el menú. Verifica que el backend esté corriendo.",
        });
      })
      .finally(() => setIsLoadingDishes(false));
  }, []);

  // Devuelve true si se creó; false para que el formulario refresque las mesas
  const handleCreateOrder = async ({ tableNumber, observations, items }) => {
    try {
      // Solo ids y cantidades: precio y mesero los pone el backend
      await createOrder({ tableNumber, observations: observations ?? "", items });
      await showSuccessAlert({
        title: "¡Orden creada!",
        text: `La orden de la mesa ${tableNumber} fue enviada a cocina.`,
      });
      navigate(-1);
      return true;
    } catch (error) {
      console.error("Error al crear la orden:", error);
      await showSystemErrorAlert({
        text: error.message || "La orden no pudo ser registrada correctamente.",
      });
      return false;
    }
  };

  // Sin cambios sale directo; con datos ingresados pide confirmación "warning"
  const handleCancel = async (isDirty) => {
    const canLeave = await confirmDiscardChanges({
      isDirty,
      title: "¿Salir sin registrar la orden?",
      text: "Los datos ingresados no se guardarán.",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Seguir registrando",
    });
    if (canLeave) navigate(-1);
  };

  return (
    <div className="bg-surface/60 dark:bg-surface/90 rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Utensils className="w-8 h-8 text-text-primary" />
          <h1 className="text-title font-heading font-bold text-text-primary">Registrar orden nueva</h1>
        </div>

        <OrderComposer
          mode="create"
          dishes={dishes}
          isLoadingDishes={isLoadingDishes}
          onSubmit={handleCreateOrder}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
