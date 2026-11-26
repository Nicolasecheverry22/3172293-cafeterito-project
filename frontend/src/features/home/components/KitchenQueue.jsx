// Cola de cocina (BEM: kitchen-queue, kitchen-ticket, wait-chip): órdenes activas de la más
// antigua a la más nueva. "Marcar lista" cambia el estado a "lista para entrega".
import { useState } from "react";
import { ChefHat, Clock, CheckCheck, PartyPopper } from "lucide-react";
import { Button } from "@/shared";
import { updateOrder } from "@/services/orderApi";
import { showConfirmAlert, showSuccessAlert, showSystemErrorAlert } from "@/shared/services/alertService";
import DashboardCard, { DashboardEmpty } from "./DashboardCard";

// verde < 10 min · ámbar 10–20 · rojo > 20
const waitLevel = (minutes) => (minutes > 20 ? "late" : minutes >= 10 ? "warn" : "ok");
const WAIT_TEXT = { ok: "a tiempo", warn: "demorada", late: "muy demorada" };

export function WaitChip({ minutes }) {
  const level = waitLevel(minutes);
  return (
    <span className={`wait-chip wait-chip--${level}`}>
      <Clock aria-hidden="true" /> {minutes} min <span className="sr-only">de espera, {WAIT_TEXT[level]}</span>
    </span>
  );
}

export default function KitchenQueue({ orders, onChanged, spanMd, spanLg }) {
  const [busyId, setBusyId] = useState(null);

  const markReady = async (order) => {
    const { isConfirmed } = await showConfirmAlert({
      title: `¿Marcar lista la orden de la mesa ${order.tableNumber}?`,
      text: `La orden #${order.orderId} pasará a "lista para entrega" y saldrá de la cola de cocina.`,
      confirmButtonText: "Sí, está lista",
      cancelButtonText: "Aún no",
      variant: "info",
    });
    if (!isConfirmed) return;

    setBusyId(order.orderId);
    try {
      // Con prepare_order el backend solo acepta el cambio de estado: el resto debe llegar igual
      await updateOrder(order.orderId, {
        tableNumber: order.tableNumber,
        waiterId: order.waiterId ?? null,
        observations: order.observations ?? "",
        items: order.items.map(({ productId, quantity }) => ({ productId, quantity })),
        status: "lista para entrega",
      });
      await showSuccessAlert({
        title: "Orden lista",
        text: `La mesa ${order.tableNumber} ya puede recibir su pedido.`,
        timer: 1500,
      });
    } catch (error) {
      await showSystemErrorAlert({ text: error.message || "No se pudo actualizar la orden." });
    } finally {
      setBusyId(null);
      onChanged?.();
    }
  };

  return (
    <DashboardCard
      id="dashboard-kitchen"
      title="Por preparar"
      icon={ChefHat}
      badge={orders.length ? `${orders.length} en cola` : null}
      spanMd={spanMd}
      spanLg={spanLg}
    >
      {orders.length === 0 ? (
        <DashboardEmpty icon={PartyPopper}>Sin órdenes por preparar 🎉</DashboardEmpty>
      ) : (
        <ol className="kitchen-queue">
          {orders.map((order) => (
            <li key={order.orderId} className="kitchen-ticket">
              <div className="kitchen-ticket__header">
                <span className="kitchen-ticket__table">Mesa {order.tableNumber}</span>
                <WaitChip minutes={order.minutes} />
              </div>
              <span className="kitchen-ticket__meta">
                Orden #{order.orderId} · {order.waiterName ?? "Sin mesero"}
              </span>
              <ul className="kitchen-ticket__items" aria-label="Platillos">
                {order.items.map((item) => (
                  <li key={item.productId} className="kitchen-ticket__item">
                    <span className="kitchen-ticket__qty">{item.quantity}×</span>
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
              {order.observations && (
                <p className="kitchen-ticket__notes">
                  <strong>Observaciones:</strong> {order.observations}
                </p>
              )}
              <Button
                variant="primary"
                shape="pill"
                size="lg"
                className="kitchen-ticket__action"
                onClick={() => markReady(order)}
                disabled={busyId === order.orderId}
                aria-label={`Marcar lista la orden de la mesa ${order.tableNumber}`}
              >
                <CheckCheck className="size-5" aria-hidden="true" />
                {busyId === order.orderId ? "Guardando..." : "Marcar lista"}
              </Button>
            </li>
          ))}
        </ol>
      )}
    </DashboardCard>
  );
}
