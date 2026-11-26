// Totales de hoy por método de pago (BEM: bar-list): barras horizontales proporcionales.
// scope "shift": solo los comprobantes del cajero en sesión ("Tu turno"); "all": todos ("Hoy").
import { Banknote, CreditCard, ArrowLeftRight, PieChart } from "lucide-react";
import { formatCOP } from "@/services/invoiceApi";
import DashboardCard, { DashboardEmpty } from "./DashboardCard";

const ICONS = { efectivo: Banknote, tarjeta: CreditCard, transferencia: ArrowLeftRight };

export default function PaymentBreakdown({ data, spanMd, spanLg }) {
  const { scope, total, methods } = data;
  const max = Math.max(...methods.map((m) => m.total), 0);
  const title = scope === "shift" ? "Pagos · Tu turno" : "Pagos · Hoy";

  return (
    <DashboardCard id="dashboard-payments" title={title} icon={PieChart} spanMd={spanMd} spanLg={spanLg}>
      {total === 0 ? (
        <DashboardEmpty icon={PieChart}>
          {scope === "shift" ? "Aún no has cobrado comprobantes hoy" : "Aún no hay pagos registrados hoy"}
        </DashboardEmpty>
      ) : (
        <>
          <ul className="bar-list">
            {methods.map(({ method, count, total: amount }) => {
              const Icon = ICONS[method];
              const pct = total ? Math.round((amount / total) * 100) : 0;
              return (
                <li key={method} className="bar-list__row">
                  <span className="bar-list__label">
                    <span className="bar-list__name">
                      {Icon && <Icon aria-hidden="true" />} {method} ({count})
                    </span>
                    <span className="bar-list__value">{formatCOP(amount)} · {pct} %</span>
                  </span>
                  <span className="bar-list__track" aria-hidden="true">
                    <span className="bar-list__fill" style={{ width: `${max ? (amount / max) * 100 : 0}%`, display: "block" }} />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="bar-list__total">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </p>
        </>
      )}
    </DashboardCard>
  );
}
