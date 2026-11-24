// Disponibilidad de mesas: una mesa está ocupada si tiene una orden abierta
// (activa o lista para entrega). Se refresca cada TABLES_REFRESH_MS y al volver a la pestaña.
// La BD sigue siendo la fuente de verdad (índice uq_orders_active_table → 409).
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrders, OPEN_ORDER_STATUSES } from "@/services/orderApi";
import { TABLE_COUNT, TABLES_REFRESH_MS } from "../config/orderConfig";

export default function useTableAvailability() {
  const [occupied, setOccupied] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // setState solo dentro de .then/.catch: nunca de forma síncrona en el efecto
  const refresh = useCallback(
    () =>
      Promise.all(OPEN_ORDER_STATUSES.map((status) => getOrders({ status })))
        .then((lists) => {
          setOccupied(new Set(lists.flat().map((order) => Number(order.tableNumber))));
          setError(null);
        })
        .catch(setError)
        .finally(() => setIsLoading(false)),
    []
  );

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, TABLES_REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // Incluye mesas por encima de TABLE_COUNT si tienen una orden abierta
  const tables = useMemo(() => {
    const total = Math.max(TABLE_COUNT, ...occupied);
    return Array.from({ length: total }, (_, i) => ({
      number: i + 1,
      isOccupied: occupied.has(i + 1),
    }));
  }, [occupied]);

  const freeCount = tables.filter((t) => !t.isOccupied).length;

  return { tables, freeCount, isLoading, error, refresh };
}
