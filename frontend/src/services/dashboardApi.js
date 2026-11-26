// Tablero de turno. El backend devuelve SOLO las secciones que los permisos del usuario
// permiten (una sección ausente = sin permiso).
import { api } from "./apiClient";

// GET /api/dashboard → { generatedAt, today, user, quickActions, kpis?, openOrders?, tables?,
//   kitchenQueue?, toCharge?, myOrders?, paymentBreakdown?, salesByHour?, inventoryAlerts?, topToday? }
export const getDashboard = () => api.get("/dashboard");

// GET /api/dashboard/badges → { openOrders?, toCharge?, kitchenQueue?, inventoryAlerts? }
// Contadores de la navegación (useNavBadges); solo los que los permisos permiten.
export const getNavBadges = () => api.get("/dashboard/badges");

// Evento (como SESSION_EVENT) para que los badges se refresquen tras una acción que
// cambia órdenes o comprobantes. withBadgesRefresh lo emite al resolverse la petición.
export const NAV_BADGES_EVENT = "nav-badges-change";
export const notifyNavBadges = () => window.dispatchEvent(new Event(NAV_BADGES_EVENT));
export const withBadgesRefresh = (result) => {
  notifyNavBadges();
  return result;
};

// Secciones operativas: si no llega ninguna, la cuenta aún no tiene módulos asignados
export const DASHBOARD_SECTIONS = [
  "kpis", "openOrders", "tables", "kitchenQueue", "toCharge", "myOrders",
  "paymentBreakdown", "salesByHour", "inventoryAlerts", "topToday",
];
