// Top 5 de platillos vendidos (BEM: top-list). Si hoy no hay ventas, el backend envía
// los últimos 7 días e indica el periodo.
import { Trophy, UtensilsCrossed } from "lucide-react";
import { ImageThumb } from "@/shared";
import DashboardCard, { DashboardEmpty } from "./DashboardCard";

const PERIOD_LABEL = { today: "Hoy", last7days: "Últimos 7 días" };

export default function TopToday({ data, spanMd, spanLg }) {
  const { period, items } = data;
  return (
    <DashboardCard
      id="dashboard-top"
      title="Más vendidos"
      icon={Trophy}
      badge={PERIOD_LABEL[period]}
      spanMd={spanMd}
      spanLg={spanLg}
    >
      {items.length === 0 ? (
        <DashboardEmpty icon={UtensilsCrossed}>Sin ventas en los últimos 7 días</DashboardEmpty>
      ) : (
        <ol className="top-list">
          {items.map((item, i) => (
            <li key={item.productId ?? item.name} className="top-list__item">
              <span className="top-list__rank" aria-hidden="true">{i + 1}</span>
              <ImageThumb src={item.imageThumb} alt={item.name} icon={UtensilsCrossed} size="sm" />
              <span className="top-list__name">{item.name}</span>
              <span className="top-list__qty">
                {item.quantity} <span className="sr-only">{item.quantity === 1 ? "unidad vendida" : "unidades vendidas"}</span>
                <span aria-hidden="true">und.</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </DashboardCard>
  );
}
