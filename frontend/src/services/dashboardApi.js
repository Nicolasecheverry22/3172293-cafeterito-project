// Tablero de turno. El backend devuelve SOLO las secciones que los permisos del usuario
// permiten (una sección ausente = sin permiso).
import { api } from "./apiClient";

// GET /api/dashboard → { generatedAt, today, user, quickActions, kpis?, openOrders?, tables?,
//   kitchenQueue?, toCharge?, myOrders?, paymentBreakdown?, salesByHour?, inventoryAlerts?, topToday? }
export const getDashboard = () => api.get("/dashboard");

// Secciones operativas: si no llega ninguna, la cuenta aún no tiene módulos asignados
export const DASHBOARD_SECTIONS = [
  "kpis", "openOrders", "tables", "kitchenQueue", "toCharge", "myOrders",
  "paymentBreakdown", "salesByHour", "inventoryAlerts", "topToday",
];
