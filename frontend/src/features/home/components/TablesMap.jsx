// Mapa de mesas del turno (BEM: tables-map). Mismo lenguaje visual que TablePicker, con un
// tercer estado. Cada mesa es un <button> con aria-label completo; el estado siempre lleva
// texto e icono además del color.
//  - libre   → nueva orden con la mesa preseleccionada (/ordensCreate?mesa=N)
//  - ocupada → vista de la orden
//  - lista   → cobrar (PaymentModal) si puede create_invoice; si no, vista de la orden
import { useNavigate } from "react-router-dom";
import { LayoutGrid, CircleCheck, Utensils, HandCoins } from "lucide-react";
import usePermission from "@/shared/hooks/usePermission";
import { formatCOP } from "@/services/invoiceApi";
import DashboardCard from "./DashboardCard";

const STATES = {
  libre: { label: "Libre", icon: CircleCheck },
  ocupada: { label: "Ocupada", icon: Utensils },
  lista: { label: "Lista para cobrar", icon: HandCoins },
};

const minutesText = (m) => `${m} ${m === 1 ? "minuto" : "minutos"}`;

export default function TablesMap({ data, onCharge, spanMd, spanLg }) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const { tables } = data;
  const counts = tables.reduce((acc, t) => ({ ...acc, [t.state]: (acc[t.state] ?? 0) + 1 }), {});

  const actionFor = (table) => {
    if (table.state === "libre") {
      return can("create_order")
        ? { run: () => navigate(`/ordensCreate?mesa=${table.number}`), hint: "crear una orden" }
        : null;
    }
    if (table.state === "lista" && can("create_invoice")) {
      return { run: () => onCharge(table.orderId), hint: "cobrar" };
    }
    return can("view_order") ? { run: () => navigate(`/OrderView/${table.orderId}`), hint: "ver la orden" } : null;
  };

  return (
    <DashboardCard
      id="dashboard-tables"
      title="Mesas"
      icon={LayoutGrid}
      badge={`${counts.libre ?? 0} de ${tables.length} libres`}
      spanMd={spanMd}
      spanLg={spanLg}
    >
      <p className="tables-map__legend">
        {Object.entries(STATES).map(([key, { label }]) => (
          <span key={key} className={`tables-map__legend-item tables-map__legend-item--${key}`}>
            {label} ({counts[key] ?? 0})
          </span>
        ))}
      </p>

      <div className="tables-map__grid">
        {tables.map((table) => {
          const state = STATES[table.state];
          const Icon = state.icon;
          const action = actionFor(table);
          const label = [
            `Mesa ${table.number}`,
            state.label.toLowerCase(),
            table.waiterName && `mesero ${table.waiterName}`,
            table.minutes != null && minutesText(table.minutes),
            action ? `Pulsa para ${action.hint}` : "Sin acciones disponibles",
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <button
              key={table.number}
              type="button"
              className={`tables-map__table tables-map__table--${table.state}`}
              onClick={action?.run}
              disabled={!action}
              aria-label={label}
              title={label}
            >
              <span className="tables-map__number" aria-hidden="true">{table.number}</span>
              <span className="tables-map__state" aria-hidden="true">
                <Icon /> {state.label}
              </span>
              {table.state !== "libre" && (
                <span className="tables-map__meta" aria-hidden="true">
                  {table.waiterName ?? "Sin mesero"}
                </span>
              )}
              {table.state !== "libre" && (
                <span className="tables-map__meta" aria-hidden="true">
                  {table.minutes} min · {formatCOP(table.total)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </DashboardCard>
  );
}
