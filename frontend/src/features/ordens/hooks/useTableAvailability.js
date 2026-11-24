// Disponibilidad de mesas: el total sale de la configuración del restaurante y una mesa
// está ocupada si tiene una orden abierta (activa o lista para entrega).
// Se refresca cada TABLES_REFRESH_MS y al volver a la pestaña, así un cambio del
// administrador llega a los meseros sin recargar. La BD sigue siendo la fuente de verdad.
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrders, OPEN_ORDER_STATUSES } from "@/services/orderApi";
import { getSettings } from "@/services/settingsApi";
import { TABLES_REFRESH_MS } from "../config/orderConfig";

export default function useTableAvailability() {
  const [tableCount, setTableCount] = useState(0);
  const [occupied, setOccupied] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // setState solo dentro de .then/.catch: nunca de forma síncrona en el efecto
  const refresh = useCallback(
    () =>
      Promise.all([getSettings(), ...OPEN_ORDER_STATUSES.map((status) => getOrders({ status }))])
        .then(([settings, ...lists]) => {
          setTableCount(settings.tableCount);
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

  const tables = useMemo(
    () =>
      Array.from({ length: tableCount }, (_, i) => ({
        number: i + 1,
        isOccupied: occupied.has(i + 1),
      })),
    [tableCount, occupied]
  );

  const freeCount = tables.filter((t) => !t.isOccupied).length;

  return { tables, freeCount, isLoading, error, refresh };
}
