// Encabezado del tablero (BEM: dashboard__header): saludo con avatar, fecha larga, roles,
// acciones rápidas (solo las que el backend permitió) y estado de la actualización.
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, HandCoins, ChefHat, PackagePlus, FileBarChart, RefreshCw } from "lucide-react";
import { Button, ImageThumb, StatusSwitch } from "@/shared";

// key del backend → icono y destino
const ACTIONS = {
  newOrder: { icon: UtensilsCrossed, to: "/ordensCreate", variant: "primary" },
  charge: { icon: HandCoins, anchor: "dashboard-to-charge", variant: "tertiary" },
  newProduct: { icon: ChefHat, to: "/menuCreate", variant: "secondary" },
  newInventory: { icon: PackagePlus, to: "/inventoryCreate", variant: "secondary" },
  salesReport: { icon: FileBarChart, to: "/invoiceList", state: { openReport: true }, variant: "secondary" },
};

// "2026-11-26" → "jueves 26 de noviembre" (mediodía: sin saltos de día por zona horaria)
const longDate = (isoDay) =>
  new Date(`${isoDay}T12:00:00`)
    .toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");

export default function DashboardHeader({
  user,
  today,
  quickActions,
  updatedLabel,
  isRefreshing,
  onRefresh,
  autoRefresh,
  onAutoRefreshChange,
}) {
  const navigate = useNavigate();

  const runAction = (key) => {
    const action = ACTIONS[key];
    if (!action) return;
    if (action.anchor) {
      const target = document.getElementById(action.anchor);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      target?.querySelector("button")?.focus({ preventScroll: true });
      return;
    }
    navigate(action.to, action.state ? { state: action.state } : undefined);
  };

  return (
    <header className="dashboard__header">
      <div className="dashboard__greeting">
        <ImageThumb src={user.imageThumb} name={user.name} alt={`Foto de ${user.name}`} size="md" round />
        <div className="min-w-0">
          <h1 className="dashboard__hello">
            {user.greeting}, {user.name?.split(" ")[0] || "bienvenido"}
          </h1>
          <p className="dashboard__date">{longDate(today)}</p>
          {user.groups?.length > 0 && (
            <div className="dashboard__roles" aria-label="Tu rol">
              {user.groups.map((g) => (
                <span key={g} className="dashboard__role">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {quickActions.length > 0 && (
        <nav className="dashboard__actions" aria-label="Acciones rápidas">
          {quickActions.map(({ key, label }) => {
            const action = ACTIONS[key];
            const Icon = action?.icon;
            return (
              <Button key={key} variant={action?.variant ?? "secondary"} size="lg" shape="pill" onClick={() => runAction(key)}>
                {Icon && <Icon className="size-5" aria-hidden="true" />}
                {label}
              </Button>
            );
          })}
        </nav>
      )}

      <div className="dashboard__sync">
        <span role="status" aria-live="polite">{updatedLabel}</span>
        <button
          type="button"
          className={`dashboard__refresh ${isRefreshing ? "dashboard__refresh--spin" : ""}`}
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Actualizar el tablero"
          title="Actualizar"
        >
          <RefreshCw aria-hidden="true" />
        </button>
        <label className="dashboard__sync-label">
          Automático (30 s)
          <StatusSwitch size="sm" checked={autoRefresh} onChange={onAutoRefreshChange} />
        </label>
      </div>
    </header>
  );
}
