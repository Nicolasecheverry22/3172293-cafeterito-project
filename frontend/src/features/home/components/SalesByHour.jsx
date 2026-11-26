// Ventas de hoy por hora (BEM: hour-chart). Barras con CSS, sin librerías. Accesible:
// la figura tiene un aria-label con el resumen y cada barra un title con su detalle.
import { BarChart3 } from "lucide-react";
import { formatCOP } from "@/services/invoiceApi";
import DashboardCard, { DashboardEmpty } from "./DashboardCard";

const hourLabel = (h) => `${String(h).padStart(2, "0")}:00`;
// Etiqueta corta sobre la barra: $120 mil / $1,2 M
const shortCOP = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`
    : `$${Math.round(n / 1000).toLocaleString("es-CO")} mil`;

export default function SalesByHour({ hours, spanMd, spanLg }) {
  const max = Math.max(...hours.map((h) => h.total), 0);
  const peak = hours.find((h) => h.total === max);
  const total = hours.reduce((sum, h) => sum + h.total, 0);
  const summary = hours.length
    ? `Ventas de hoy por hora: ${formatCOP(total)} en ${hours.length} ${hours.length === 1 ? "hora" : "horas"} con ventas. ` +
      `Hora pico ${hourLabel(peak.hour)} con ${formatCOP(peak.total)}.`
    : "";

  return (
    <DashboardCard id="dashboard-sales-hour" title="Ventas por hora" icon={BarChart3} spanMd={spanMd} spanLg={spanLg}>
      {hours.length === 0 ? (
        <DashboardEmpty icon={BarChart3}>Aún no hay ventas hoy</DashboardEmpty>
      ) : (
        <figure className="hour-chart">
          <div className="hour-chart__plot" role="img" aria-label={summary}>
            {hours.map((h) => {
              const detail = `${hourLabel(h.hour)} – ${formatCOP(h.total)} (${h.count} ${h.count === 1 ? "comprobante" : "comprobantes"})`;
              return (
                <div key={h.hour} className="hour-chart__col" title={detail}>
                  <span className="hour-chart__amount" aria-hidden="true">{shortCOP(h.total)}</span>
                  <span className="hour-chart__track">
                    <span className="hour-chart__bar" style={{ height: `${max ? Math.max((h.total / max) * 100, 3) : 0}%` }} />
                  </span>
                  <span className="hour-chart__label" aria-hidden="true">{String(h.hour).padStart(2, "0")}</span>
                </div>
              );
            })}
          </div>
          <figcaption className="hour-chart__summary">{summary}</figcaption>
        </figure>
      )}
    </DashboardCard>
  );
}
