// Órdenes abiertas del mesero en sesión (BEM: order-list, order-status) con acceso rápido.
import { useNavigate } from "react-router-dom";
import { ClipboardList, Utensils, HandCoins, Eye, Pencil } from "lucide-react";
import { Button } from "@/shared";
import usePermission from "@/shared/hooks/usePermission";
import { formatCOP } from "@/services/invoiceApi";
import DashboardCard from "./DashboardCard";
import { WaitChip } from "./KitchenQueue";

export function OrderStatus({ status }) {
  const ready = status === "lista para entrega";
  const Icon = ready ? HandCoins : Utensils;
  return (
    <span className={`order-status order-status--${ready ? "lista" : "activa"}`}>
      <Icon aria-hidden="true" /> {ready ? "Lista para entrega" : "En preparación"}
    </span>
  );
}

export default function MyOrders({ orders, spanMd, spanLg }) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const canEdit = can("update_order");

  return (
    <DashboardCard id="dashboard-my-orders" title="Mis órdenes" icon={ClipboardList} badge={orders.length} spanMd={spanMd} spanLg={spanLg}>
      <ul className="order-list">
        {orders.map((o) => (
          <li key={o.orderId} className="order-list__item">
            <div className="order-list__info">
              <span className="order-list__title">Mesa {o.tableNumber} · #{o.orderId}</span>
              <span className="order-list__meta">{formatCOP(o.total)}</span>
            </div>
            <OrderStatus status={o.status} />
            <WaitChip minutes={o.minutes} />
            <Button
              variant="outline"
              shape="pill"
              className="order-list__action"
              onClick={() => navigate(canEdit ? `/EditOrder/${o.orderId}` : `/OrderView/${o.orderId}`)}
              aria-label={`${canEdit ? "Editar" : "Ver"} la orden de la mesa ${o.tableNumber}`}
            >
              {canEdit ? <Pencil className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              {canEdit ? "Editar" : "Ver"}
            </Button>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
