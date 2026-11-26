// KPIs de ventas (BEM: kpi-grid, kpi). Variación vs. ayer a la misma hora con flecha y
// color; el color siempre va con texto ("+12 %", "Sin datos de ayer").
import { Wallet, Receipt, Calculator, ClipboardList, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCOP } from "@/services/invoiceApi";
import DashboardCard from "./DashboardCard";

function Trend({ pct }) {
  if (pct == null) return <span className="kpi__trend kpi__trend--none">Sin datos de ayer</span>;
  const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  const text = `${pct > 0 ? "+" : ""}${pct.toLocaleString("es-CO", { maximumFractionDigits: 1 })} %`;
  return (
    <span className={`kpi__trend kpi__trend--${dir}`}>
      <Icon aria-hidden="true" />
      {text} vs. ayer a esta hora
    </span>
  );
}

function Kpi({ icon: Icon, label, value, children }) {
  return (
    <div className="kpi">
      <span className="kpi__label"><Icon aria-hidden="true" /> {label}</span>
      <span className="kpi__value">{value}</span>
      {children}
    </div>
  );
}

export default function KpiCards({ kpis, openOrders, spanMd, spanLg }) {
  const open = openOrders ?? { total: kpis.openOrders };
  return (
    <DashboardCard id="dashboard-kpis" title="Resumen de hoy" icon={Wallet} spanMd={spanMd} spanLg={spanLg}>
      <div className="kpi-grid">
        <Kpi icon={Wallet} label="Ventas hoy" value={formatCOP(kpis.salesToday)}>
          <Trend pct={kpis.variationPct} />
        </Kpi>
        <Kpi icon={Receipt} label="Comprobantes" value={kpis.invoicesToday.toLocaleString("es-CO")}>
          <span className="kpi__trend kpi__trend--none">emitidos hoy</span>
        </Kpi>
        <Kpi icon={Calculator} label="Ticket promedio" value={formatCOP(kpis.averageTicket)}>
          <span className="kpi__trend kpi__trend--none">por comprobante</span>
        </Kpi>
        <Kpi icon={ClipboardList} label="Órdenes abiertas" value={open.total.toLocaleString("es-CO")}>
          <span className="kpi__trend kpi__trend--none">
            {open.active != null ? `${open.active} en preparación · ${open.ready} ${open.ready === 1 ? "lista" : "listas"}` : "activas y listas"}
          </span>
        </Kpi>
      </div>
    </DashboardCard>
  );
}
