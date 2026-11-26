// Tablero de turno. Cada sección depende de un PERMISO (no del nombre del rol): si el
// usuario no lo tiene, la sección no se consulta ni viaja en la respuesta.
// Las consultas de las secciones permitidas se ejecutan en paralelo.
import { can } from "../access/access.service.js";
import { dashboardRepository as repo, DASHBOARD_TZ } from "./dashboard.repository.js";

// Acciones rápidas, en el orden en que se muestran
const QUICK_ACTIONS = [
  { key: "newOrder", label: "Nueva orden", permission: "create_order" },
  { key: "charge", label: "Cobrar", permission: "create_invoice" },
  { key: "newProduct", label: "Crear platillo", permission: "create_product" },
  { key: "newInventory", label: "Registrar insumo", permission: "create_inventory" },
  { key: "salesReport", label: "Reporte de ventas", permission: "report_invoice" },
];

const PAYMENT_METHODS = ["efectivo", "tarjeta", "transferencia"];

// Hora y fecha actuales en Bogotá (independiente de la zona del servidor)
function nowInBogota() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: DASHBOARD_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return { hour: Number(parts.hour), date: `${parts.year}-${parts.month}-${parts.day}` };
}

const greetingFor = (hour) =>
  hour >= 5 && hour < 12 ? "Buenos días" : hour >= 12 && hour < 19 ? "Buenas tardes" : "Buenas noches";

const round2 = (n) => Math.round(n * 100) / 100;

// Mapa de mesas 1..N. Si hubiera una orden abierta en una mesa por encima de N (no
// debería: settings lo impide), también se muestra.
function buildTables(tableCount, openOrders) {
  const byTable = new Map(openOrders.map((o) => [o.tableNumber, o]));
  const total = Math.max(tableCount, ...openOrders.map((o) => o.tableNumber), 0);
  return {
    tableCount,
    tables: Array.from({ length: total }, (_, i) => {
      const number = i + 1;
      const order = byTable.get(number);
      if (!order) return { number, state: "libre" };
      return {
        number,
        state: order.status === "lista para entrega" ? "lista" : "ocupada",
        orderId: order.orderId,
        waiterName: order.waiterName,
        minutes: order.minutes,
        total: order.total,
      };
    }),
  };
}

export const dashboardService = {
  // auth = req.auth ({ isSuperuser, permissions }); userId = req.user.id
  async getDashboard(userId, auth) {
    const has = (code) => can(auth, code);
    const { hour, date } = nowInBogota();

    // Consultas compartidas (se piden una sola vez aunque las usen varias secciones)
    const needsOpenOrders = has("list_order") || has("create_invoice");
    const tasks = {
      user: repo.getUser(userId),
      kpis: has("report_invoice") ? repo.getSalesKpis() : null,
      openCounts: has("list_order") || has("report_invoice") ? repo.getOpenOrderCounts() : null,
      openOrders: needsOpenOrders ? repo.getOpenOrders() : null,
      tableCount: has("list_order") ? repo.getTableCount() : null,
      kitchenQueue: has("prepare_order") ? repo.getKitchenQueue(15) : null,
      myOrders: has("list_order") ? repo.getOpenOrders({ waiterId: userId }) : null,
      paymentBreakdown: has("list_invoice")
        ? repo.getPaymentBreakdown({ cashierId: has("report_invoice") ? null : userId })
        : null,
      salesByHour: has("report_invoice") ? repo.getSalesByHour() : null,
      inventoryAlerts: has("list_inventory") ? repo.getInventoryAlerts({ limit: 8, days: 3 }) : null,
      topToday: has("list_product") ? repo.getTopProducts({ daysBack: 0, limit: 5 }) : null,
    };
    const keys = Object.keys(tasks);
    const values = await Promise.all(keys.map((k) => tasks[k]));
    const r = Object.fromEntries(keys.map((k, i) => [k, values[i]]));

    const response = {
      generatedAt: new Date().toISOString(),
      today: date,
      timeZone: DASHBOARD_TZ,
      user: {
        name: r.user?.name ?? "",
        imageThumb: r.user?.imageThumb ?? null,
        groups: r.user?.groups ?? [],
        greeting: greetingFor(hour),
      },
      quickActions: QUICK_ACTIONS.filter((a) => has(a.permission)).map(({ key, label }) => ({ key, label })),
    };

    if (r.kpis) {
      const { salesToday, invoicesToday, salesYesterday } = r.kpis;
      response.kpis = {
        salesToday,
        invoicesToday,
        averageTicket: invoicesToday ? round2(salesToday / invoicesToday) : 0,
        salesYesterdaySameTime: salesYesterday,
        variationPct: salesYesterday > 0 ? round2(((salesToday - salesYesterday) / salesYesterday) * 100) : null,
        openOrders: r.openCounts?.total ?? 0,
      };
    }

    if (has("list_order")) {
      response.openOrders = r.openCounts;
      response.tables = buildTables(r.tableCount, r.openOrders);
      // Solo si el usuario es mesero de órdenes abiertas
      if (r.myOrders.length) response.myOrders = r.myOrders;
    }

    if (r.kitchenQueue) response.kitchenQueue = r.kitchenQueue;

    if (has("create_invoice")) {
      response.toCharge = {
        ready: r.openOrders.filter((o) => o.status === "lista para entrega"),
        inProgress: r.openOrders.filter((o) => o.status === "activa"),
      };
    }

    if (r.paymentBreakdown) {
      const byMethod = new Map(r.paymentBreakdown.map((m) => [m.method, m]));
      const methods = PAYMENT_METHODS.map((method) => ({
        method,
        count: byMethod.get(method)?.count ?? 0,
        total: byMethod.get(method)?.total ?? 0,
      }));
      response.paymentBreakdown = {
        scope: has("report_invoice") ? "all" : "shift",
        total: round2(methods.reduce((sum, m) => sum + m.total, 0)),
        methods,
      };
    }

    if (r.salesByHour) response.salesByHour = r.salesByHour;

    if (r.inventoryAlerts) {
      response.inventoryAlerts = {
        total: r.inventoryAlerts[0]?.totalAlerts ?? 0,
        items: r.inventoryAlerts.map(({ totalAlerts: _total, ...item }) => item),
      };
    }

    if (r.topToday) {
      // Sin ventas hoy → top de los últimos 7 días (hoy + 6 anteriores)
      const items = r.topToday.length ? r.topToday : await repo.getTopProducts({ daysBack: 6, limit: 5 });
      response.topToday = { period: r.topToday.length ? "today" : "last7days", items };
    }

    return response;
  },

  // Contadores livianos para la navegación (GET /api/dashboard/badges). Mismo criterio de
  // permisos que getDashboard; solo conteos, en paralelo:
  //  openOrders (list_order) · toCharge (create_invoice: 'lista para entrega') ·
  //  kitchenQueue (prepare_order: 'activa') · inventoryAlerts (list_inventory).
  async getBadges(auth) {
    const has = (code) => can(auth, code);
    const needsOrders = has("list_order") || has("create_invoice") || has("prepare_order");
    const [orders, inventoryAlerts] = await Promise.all([
      needsOrders ? repo.getOpenOrderCounts() : null,
      has("list_inventory") ? repo.countInventoryAlerts({ days: 3 }) : null,
    ]);

    const badges = {};
    if (has("list_order")) badges.openOrders = orders.total;
    if (has("create_invoice")) badges.toCharge = orders.ready;
    if (has("prepare_order")) badges.kitchenQueue = orders.active;
    if (inventoryAlerts !== null) badges.inventoryAlerts = inventoryAlerts;
    return badges;
  },
};
