// Registrar orden (BEM: order-composer): mesa → platillos → resumen.
// El empleado encargado no se elige: el backend asigna al usuario del token.
import { useState } from "react";
import { Button } from "@/shared";
import { getSessionUser } from "@/services/apiClient";
import { createOrderSchema } from "../schemas/orderSchema";
import useTableAvailability from "../hooks/useTableAvailability";
import useOrderCart from "../hooks/useOrderCart";
import TablePicker from "./TablePicker";
import WaiterBadge from "./WaiterBadge";
import MenuPicker from "./MenuPicker";
import OrderSummary from "./OrderSummary";

const formatCOP = (value) => `$${value.toLocaleString("es-CO")}`;

export default function OrderForm({ dishes = [], isLoadingDishes = false, onSubmit, onCancel }) {
  const [tableNumber, setTableNumber] = useState(null);
  const [observations, setObservations] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availability = useTableAvailability();
  const cart = useOrderCart(dishes);
  const sessionUser = getSessionUser();

  // Si otro mesero ocupa la mesa elegida mientras se arma la orden, la selección se anula.
  // Se deriva en el render (sin useEffect) para no provocar renders en cascada.
  const selectedTaken = availability.tables.some((t) => t.number === tableNumber && t.isOccupied);
  const selectedTable = selectedTaken ? null : tableNumber;
  const visibleErrors = selectedTaken
    ? { ...errors, tableNumber: "La mesa que elegiste acaba de ocuparse. Elige otra." }
    : errors;

  const selectTable = (number) => {
    setTableNumber(number);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.tableNumber;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = createOrderSchema().safeParse({ tableNumber: selectedTable, observations, items: cart.lines });

    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const ok = await onSubmit(result.data);
      // Si falló (p. ej. 409 mesa ocupada) se refresca el mapa para que el mesero vea el estado real
      if (!ok) availability.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = isSubmitting ? "Guardando..." : `Crear orden · ${formatCOP(cart.total)}`;

  return (
    <form onSubmit={handleSubmit} className="order-composer" noValidate>
      <div className="order-composer__main">
        <WaiterBadge user={sessionUser} />
        <TablePicker
          tables={availability.tables}
          value={selectedTable}
          onChange={selectTable}
          freeCount={availability.freeCount}
          isLoading={availability.isLoading}
          error={availability.error}
          onRefresh={availability.refresh}
        />
        <MenuPicker dishes={dishes} isLoading={isLoadingDishes} cart={cart} />
      </div>

      <aside className="order-composer__aside">
        <OrderSummary
          tableNumber={selectedTable}
          cart={cart}
          observations={observations}
          onObservationsChange={setObservations}
          errors={visibleErrors}
        />
        <div className="order-composer__actions">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting} className="order-composer__submit">
            {submitLabel}
          </Button>
        </div>
      </aside>

      {/* Barra fija en móvil: total y envío siempre a la vista */}
      <div className="order-composer__mobile-bar">
        <div className="order-composer__mobile-total">
          <span>{selectedTable ? `Mesa ${selectedTable}` : "Sin mesa"} · {cart.totalItems} platillos</span>
          <strong>{formatCOP(cart.total)}</strong>
        </div>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}
