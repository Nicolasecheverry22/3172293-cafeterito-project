// Alertas de inventario (BEM: alert-list). Agotado / vencido = error; bajo mínimo /
// por vencer = warning. Cada alerta lleva icono y texto, no solo color.
import { Link } from "react-router-dom";
import { PackageX, OctagonAlert, TriangleAlert, PackageCheck } from "lucide-react";
import usePermission from "@/shared/hooks/usePermission";
import DashboardCard, { DashboardEmpty } from "./DashboardCard";

const TYPE_LABEL = {
  agotado: "Agotado",
  vencido: "Vencido",
  bajo_minimo: "Bajo mínimo",
  por_vencer: "Por vencer",
};

function detailOf(item) {
  const stock = `${item.stock}/${item.minStock} ${item.unit ?? ""}`.trim();
  switch (item.type) {
    case "por_vencer":
      return item.daysToExpire === 0 ? "Vence hoy" : `Vence en ${item.daysToExpire} ${item.daysToExpire === 1 ? "día" : "días"}`;
    case "vencido":
      return item.expirationDate ? `Venció el ${item.expirationDate.split("-").reverse().join("/")}` : `Estado vencido · stock ${stock}`;
    case "agotado":
      return `Stock ${stock}`;
    default:
      return `Stock ${stock} (mínimo ${item.minStock})`;
  }
}

export default function InventoryAlerts({ data, spanMd, spanLg }) {
  const { can } = usePermission();
  const canView = can("view_inventory");
  const { total, items } = data;

  return (
    <DashboardCard
      id="dashboard-inventory"
      title="Inventario"
      icon={PackageX}
      badge={total ? `${total} ${total === 1 ? "alerta" : "alertas"}` : null}
      action={total > items.length ? <Link to="/inventoryList" className="dashboard-card__link">Ver todas</Link> : null}
      spanMd={spanMd}
      spanLg={spanLg}
    >
      {items.length === 0 ? (
        <DashboardEmpty icon={PackageCheck}>No hay alertas de inventario</DashboardEmpty>
      ) : (
        <ul className="alert-list">
          {items.map((item) => {
            const Icon = item.severity === "error" ? OctagonAlert : TriangleAlert;
            return (
              <li key={item.id} className={`alert-list__item alert-list__item--${item.severity}`}>
                <Icon className="alert-list__icon" aria-hidden="true" />
                <div className="alert-list__info">
                  {canView ? (
                    <Link to={`/InventoryView/${item.id}`} className="alert-list__name alert-list__link">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="alert-list__name">{item.name}</span>
                  )}
                  <span className="alert-list__detail">
                    <strong>{TYPE_LABEL[item.type]}</strong> · {detailOf(item)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
