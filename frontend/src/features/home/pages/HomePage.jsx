// Tablero de turno (BEM: dashboard). Muestra a cada usuario lo que necesita AHORA según sus
// PERMISOS: el backend (GET /api/dashboard) solo envía las secciones permitidas.
// - Refresca cada 30 s mientras la pestaña está visible (document.visibilityState) y tras
//   las acciones hechas desde el tablero (marcar lista, cobrar).
// - El orden de las tarjetas depende de lo que tenga el usuario (ver buildLayout).
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloudOff, RefreshCw, UserRoundX } from "lucide-react";
import { Button } from "@/shared";
import { getDashboard, DASHBOARD_SECTIONS } from "@/services/dashboardApi";
import PaymentModal from "@/features/invoices/components/PaymentModal";
import DashboardHeader from "../components/DashboardHeader";
import DashboardCard, { DashboardSkeleton, DashboardEmpty } from "../components/DashboardCard";
import KpiCards from "../components/KpiCards";
import TablesMap from "../components/TablesMap";
import KitchenQueue from "../components/KitchenQueue";
import ToCharge from "../components/ToCharge";
import MyOrders from "../components/MyOrders";
import PaymentBreakdown from "../components/PaymentBreakdown";
import SalesByHour from "../components/SalesByHour";
import InventoryAlerts from "../components/InventoryAlerts";
import TopToday from "../components/TopToday";

const REFRESH_MS = 30_000;

// Ancho base de cada tarjeta en el grid de 12 columnas (lg)
const BASE_SPAN = {
  kpis: 12, kitchenQueue: 12, tables: 8, myOrders: 4, toCharge: 6, paymentBreakdown: 6,
  inventoryAlerts: 4, salesByHour: 8, topToday: 4,
};
const DEFAULT_ORDER = [
  "kitchenQueue", "kpis", "toCharge", "paymentBreakdown", "tables", "myOrders",
  "inventoryAlerts", "salesByHour", "topToday",
];

// Rellena filas: si una tarjeta no cabe en la fila, la anterior se estira hasta el final
// (sin huecos aunque falte la tarjeta "pareja").
function pack(keys, cols, spanOf) {
  const spans = keys.map((k) => Math.min(spanOf(k), cols));
  let used = 0;
  spans.forEach((span, i) => {
    if (used + span > cols) {
      spans[i - 1] += cols - used;
      used = 0;
    }
    used += span;
  });
  if (spans.length && used < cols) spans[spans.length - 1] += cols - used;
  return spans;
}

// Prioridad según permisos (presencia de secciones en la respuesta)
function buildLayout(data) {
  const has = (k) => data[k] != null;
  const order = [];
  if (has("kitchenQueue")) order.push("kitchenQueue");                                 // cocina
  if (has("toCharge") && !has("kpis")) order.push("toCharge", "paymentBreakdown");     // caja sin reportes
  if (has("tables") && !has("kpis")) order.push("tables", "myOrders");                 // mesero
  if (has("kpis")) order.push("kpis", "tables", "inventoryAlerts", "salesByHour", "topToday"); // reportes
  const keys = [...new Set([...order, ...DEFAULT_ORDER])].filter(has);

  const lg = pack(keys, 12, (k) => BASE_SPAN[k]);
  const md = pack(keys, 2, (k) => (BASE_SPAN[k] >= 8 ? 2 : 1));
  return keys.map((key, i) => ({ key, spanLg: lg[i], spanMd: md[i] }));
}

const updatedText = (updatedAt, now) => {
  if (!updatedAt) return "";
  const s = Math.max(0, Math.round((now - updatedAt) / 1000));
  if (s < 5) return "Actualizado ahora";
  if (s < 60) return `Actualizado hace ${s} s`;
  return `Actualizado hace ${Math.floor(s / 60)} min`;
};

export default function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === "visible");
  const [chargingOrderId, setChargingOrderId] = useState(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsRefreshing(true);
    try {
      const next = await getDashboard();
      setData(next);
      setError(null);
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(err);
    } finally {
      inFlight.current = false;
      setIsRefreshing(false);
    }
  }, []);

  // Primera carga
  useEffect(() => {
    const id = setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load]);

  // Visibilidad de la pestaña: al volver se refresca de inmediato
  useEffect(() => {
    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      setIsVisible(visible);
      if (visible) load();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [load]);

  // Polling cada 30 s y reloj de "hace X s": solo con la pestaña visible
  useEffect(() => {
    if (!isVisible) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = autoRefresh ? setInterval(load, REFRESH_MS) : null;
    return () => {
      clearInterval(tick);
      if (poll) clearInterval(poll);
    };
  }, [isVisible, autoRefresh, load]);

  const layout = useMemo(() => (data ? buildLayout(data) : []), [data]);

  if (!data) {
    if (!error) return <DashboardSkeleton />;
    return (
      <div className="dashboard">
        <DashboardCard id="dashboard-error" title="No se pudo cargar el tablero" icon={CloudOff}>
          <DashboardEmpty icon={CloudOff}>
            {error.message || "Verifica tu conexión o que el servidor esté disponible."}
          </DashboardEmpty>
          <Button variant="primary" shape="pill" size="lg" onClick={load} disabled={isRefreshing} className="self-start">
            <RefreshCw className="size-5" aria-hidden="true" /> Reintentar
          </Button>
        </DashboardCard>
      </div>
    );
  }

  const hasOperational = DASHBOARD_SECTIONS.some((k) => data[k] != null);
  const shared = { onCharge: setChargingOrderId };

  const renderSection = ({ key, spanLg, spanMd }) => {
    const span = { spanLg, spanMd };
    switch (key) {
      case "kpis": return <KpiCards {...span} kpis={data.kpis} openOrders={data.openOrders} />;
      case "kitchenQueue": return <KitchenQueue {...span} orders={data.kitchenQueue} onChanged={load} />;
      case "tables": return <TablesMap {...span} data={data.tables} {...shared} />;
      case "toCharge": return <ToCharge {...span} data={data.toCharge} {...shared} />;
      case "myOrders": return <MyOrders {...span} orders={data.myOrders} />;
      case "paymentBreakdown": return <PaymentBreakdown {...span} data={data.paymentBreakdown} />;
      case "salesByHour": return <SalesByHour {...span} hours={data.salesByHour} />;
      case "inventoryAlerts": return <InventoryAlerts {...span} data={data.inventoryAlerts} />;
      case "topToday": return <TopToday {...span} data={data.topToday} />;
      default: return null;
    }
  };

  return (
    <div className="dashboard">
      <DashboardHeader
        user={data.user}
        today={data.today}
        quickActions={data.quickActions}
        updatedLabel={updatedText(updatedAt, now)}
        isRefreshing={isRefreshing}
        onRefresh={load}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
      />

      {error && (
        <div className="dashboard__banner" role="alert">
          <CloudOff className="size-5" aria-hidden="true" />
          <span>No se pudo actualizar el tablero. Se muestran los últimos datos.</span>
          <Button variant="secondary" shape="pill" onClick={load} disabled={isRefreshing}>Reintentar</Button>
        </div>
      )}

      {hasOperational ? (
        <div className="dashboard__grid">
          {layout.map((item) => <Fragment key={item.key}>{renderSection(item)}</Fragment>)}
        </div>
      ) : (
        <DashboardCard id="dashboard-no-modules" title="Sin módulos asignados" icon={UserRoundX}>
          <DashboardEmpty icon={UserRoundX}>
            Tu cuenta aún no tiene módulos asignados. Contacta al administrador.
            <br />
            <strong>Rol: {data.user.groups?.length ? data.user.groups.join(", ") : "Sin rol"}</strong>
          </DashboardEmpty>
        </DashboardCard>
      )}

      {chargingOrderId && (
        <PaymentModal
          orderId={chargingOrderId}
          onClose={() => {
            setChargingOrderId(null);
            load();
          }}
          onPaid={load}
        />
      )}
    </div>
  );
}
