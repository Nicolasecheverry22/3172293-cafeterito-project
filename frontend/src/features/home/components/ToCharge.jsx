// Órdenes por cobrar (BEM: order-list). Primero las "lista para entrega"; las activas van
// aparte ("En preparación"), también cobrables como en el listado de órdenes.
import { HandCoins, Receipt } from "lucide-react";
import { Button } from "@/shared";
import { formatCOP } from "@/services/invoiceApi";
import DashboardCard, { DashboardEmpty } from "./DashboardCard";
import { WaitChip } from "./KitchenQueue";

function ChargeRow({ order, onCharge, primary }) {
  return (
    <li className="order-list__item">
      <div className="order-list__info">
        <span className="order-list__title">Mesa {order.tableNumber} · #{order.orderId}</span>
        <span className="order-list__meta">{order.waiterName ?? "Sin mesero"}</span>
      </div>
      <WaitChip minutes={order.minutes} />
      <span className="order-list__total">{formatCOP(order.total)}</span>
      <Button
        variant={primary ? "primary" : "outline"}
        shape="pill"
        className="order-list__action"
        onClick={() => onCharge(order.orderId)}
        aria-label={`Cobrar la orden de la mesa ${order.tableNumber}, ${formatCOP(order.total)}`}
      >
        <HandCoins className="size-4" aria-hidden="true" /> Cobrar
      </Button>
    </li>
  );
}

export default function ToCharge({ data, onCharge, spanMd, spanLg }) {
  const { ready, inProgress } = data;
  return (
    <DashboardCard
      id="dashboard-to-charge"
      title="Por cobrar"
      icon={HandCoins}
      badge={ready.length ? `${ready.length} ${ready.length === 1 ? "lista" : "listas"}` : null}
      spanMd={spanMd}
      spanLg={spanLg}
    >
      {ready.length === 0 && inProgress.length === 0 ? (
        <DashboardEmpty icon={Receipt}>No hay órdenes por cobrar</DashboardEmpty>
      ) : (
        <>
          {ready.length > 0 ? (
            <ul className="order-list" aria-label="Listas para cobrar">
              {ready.map((o) => <ChargeRow key={o.orderId} order={o} onCharge={onCharge} primary />)}
            </ul>
          ) : (
            <DashboardEmpty icon={Receipt}>Ninguna orden está lista para cobrar todavía</DashboardEmpty>
          )}
          {inProgress.length > 0 && (
            <>
              <h3 className="order-list__subtitle">En preparación ({inProgress.length})</h3>
              <ul className="order-list" aria-label="En preparación">
                {inProgress.map((o) => <ChargeRow key={o.orderId} order={o} onCharge={onCharge} />)}
              </ul>
            </>
          )}
        </>
      )}
    </DashboardCard>
  );
}
