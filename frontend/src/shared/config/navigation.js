// Fuente de verdad de la navegación autenticada: barra lateral (Sidebar), barra inferior
// móvil (BottomNav) y títulos/breadcrumb de la barra superior (TopBar).
//
// Ítem: { key, label, shortLabel?, to, icon, permission?, badgeKey?, matchPaths }
//  - permission: código list_* (o el que corresponda); sin él, visible para todos.
//  - matchPaths: patrones de React Router en los que el ítem se marca activo (su listado
//    y TODAS sus rutas hijas: crear, ver y editar). Cubren todas las rutas de router.jsx.
//  - badgeKey: contador en vivo (ver resolveBadge y useNavBadges).
import { matchPath } from "react-router-dom";
import {
  ClipboardList,
  Home,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    key: "main",
    title: null,
    items: [{ key: "home", label: "Inicio", to: "/home", icon: Home, matchPaths: ["/home"] }],
  },
  {
    key: "operation",
    title: "Operación",
    items: [
      {
        key: "orders", label: "Órdenes", to: "/ordensList", icon: ClipboardList,
        permission: "list_order", badgeKey: "orders",
        matchPaths: ["/ordensList", "/ordensCreate", "/OrderView/:id", "/EditOrder/:id"],
      },
      {
        key: "invoices", label: "Comprobantes", shortLabel: "Cobros", to: "/invoiceList", icon: Receipt,
        permission: "list_invoice", badgeKey: "toCharge",
        matchPaths: ["/invoiceList", "/InvoiceView/:id"],
      },
    ],
  },
  {
    key: "catalog",
    title: "Catálogo",
    items: [
      {
        key: "menu", label: "Menú", to: "/menuList", icon: UtensilsCrossed, permission: "list_product",
        matchPaths: ["/menuList", "/menuCreate", "/ProductView/:id", "/EditProduct/:id"],
      },
      {
        key: "inventory", label: "Inventario", to: "/inventoryList", icon: Package,
        permission: "list_inventory", badgeKey: "inventoryAlerts",
        matchPaths: ["/inventoryList", "/inventoryCreate", "/InventoryView/:id", "/editInventory/:id"],
      },
      {
        key: "providers", label: "Proveedores", to: "/providerList", icon: Truck, permission: "list_provider",
        matchPaths: ["/providerList", "/providerCreate", "/ProviderView/:id", "/EditProvider/:id"],
      },
    ],
  },
  {
    key: "admin",
    title: "Administración",
    items: [
      {
        key: "users", label: "Usuarios", to: "/userList", icon: Users, permission: "list_user",
        matchPaths: ["/userList", "/userCreate", "/UserView/:id", "/EditUser/:id"],
      },
      {
        key: "permissions", label: "Permisos", to: "/permits", icon: ShieldCheck,
        permission: "manage_permissions", matchPaths: ["/permits"],
      },
      { key: "settings", label: "Configuración", to: "/settings", icon: Settings, matchPaths: ["/settings"] },
    ],
  },
];

// Orden de "mayor uso" para la barra inferior móvil (Inicio + 2 de estos + "Más")
const BOTTOM_NAV_PRIORITY = ["orders", "invoices", "menu", "inventory", "users"];
const BOTTOM_NAV_MODULES = 2;

// Secciones con solo los ítems permitidos; una sección sin ítems no se devuelve
export const getVisibleSections = (can) =>
  NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((section) => section.items.length > 0);

export function getBottomNavItems(sections) {
  const byKey = new Map(sections.flatMap((s) => s.items).map((item) => [item.key, item]));
  const modules = BOTTOM_NAV_PRIORITY.map((key) => byKey.get(key)).filter(Boolean);
  return [byKey.get("home"), ...modules.slice(0, BOTTOM_NAV_MODULES)].filter(Boolean);
}

// ── Títulos por ruta (TopBar) ───────────────────────────────────
// back: vista de detalle o formulario → botón "Volver" + breadcrumb y fondo de formulario.
// title puede ser una función de los parámetros de la ruta (p. ej. "Orden #45").
const PAGE_TITLES = {
  "/home": { title: "Inicio" },
  "/profile": { title: "Mi perfil" },
  "/settings": { title: "Configuración" },
  "/permits": { title: "Gestión de permisos" },

  "/ordensList": { title: "Órdenes" },
  "/ordensCreate": { title: "Nueva orden", back: true },
  "/OrderView/:id": { title: ({ id }) => `Orden #${id}`, back: true },
  "/EditOrder/:id": { title: ({ id }) => `Editar orden #${id}`, back: true },

  "/invoiceList": { title: "Comprobantes" },
  "/InvoiceView/:id": { title: ({ id }) => `Comprobante #${id}`, back: true },

  "/menuList": { title: "Menú" },
  "/menuCreate": { title: "Nuevo platillo", back: true },
  "/ProductView/:id": { title: ({ id }) => `Platillo #${id}`, back: true },
  "/EditProduct/:id": { title: ({ id }) => `Editar platillo #${id}`, back: true },

  "/inventoryList": { title: "Inventario" },
  "/inventoryCreate": { title: "Nuevo insumo", back: true },
  "/InventoryView/:id": { title: ({ id }) => `Insumo #${id}`, back: true },
  "/editInventory/:id": { title: ({ id }) => `Editar insumo #${id}`, back: true },

  "/providerList": { title: "Proveedores" },
  "/providerCreate": { title: "Nuevo proveedor", back: true },
  "/ProviderView/:id": { title: ({ id }) => `Proveedor #${id}`, back: true },
  "/EditProvider/:id": { title: ({ id }) => `Editar proveedor #${id}`, back: true },

  "/userList": { title: "Usuarios" },
  "/userCreate": { title: "Nuevo usuario", back: true },
  "/UserView/:id": { title: ({ id }) => `Usuario #${id}`, back: true },
  "/EditUser/:id": { title: ({ id }) => `Editar usuario #${id}`, back: true },
};

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

// pathname → { item, title, back }. item = ítem de navegación activo (o null, p. ej. /profile)
export function getRouteMeta(pathname) {
  const item =
    ALL_ITEMS.find((i) => i.matchPaths.some((pattern) => matchPath(pattern, pathname))) ?? null;

  for (const [pattern, meta] of Object.entries(PAGE_TITLES)) {
    const match = matchPath(pattern, pathname);
    if (match) {
      const title = typeof meta.title === "function" ? meta.title(match.params) : meta.title;
      return { item, title, back: Boolean(meta.back) };
    }
  }
  return { item, title: item?.label ?? "Cafeterito", back: false };
}

// ── Contadores (badges) ─────────────────────────────────────────
// badges = respuesta de GET /api/dashboard/badges (solo trae lo que el usuario puede ver).
// Órdenes: abiertas; para quien prepara pero no toma pedidos (cocina), las de la cola.
// Devuelve { count, label, tone } o null si no hay nada que mostrar (0 o sin permiso).
export function resolveBadge(badgeKey, badges, can) {
  if (!badgeKey || !badges) return null;
  let count;
  let label;
  let tone = "error";
  if (badgeKey === "orders") {
    const kitchen = can("prepare_order") && !can("create_order") && badges.kitchenQueue != null;
    count = kitchen ? badges.kitchenQueue : badges.openOrders;
    label = kitchen ? `${count} en cocina` : `${count} ${count === 1 ? "abierta" : "abiertas"}`;
  } else if (badgeKey === "toCharge") {
    count = badges.toCharge;
    label = `${count} por cobrar`;
  } else if (badgeKey === "inventoryAlerts") {
    count = badges.inventoryAlerts;
    label = `${count} ${count === 1 ? "alerta" : "alertas"}`;
    tone = "warning";
  }
  if (!count) return null;
  return { count, text: count > 99 ? "99+" : String(count), label, tone };
}

// "Órdenes, 3 abiertas"
export const itemAriaLabel = (item, badge) => (badge ? `${item.label}, ${badge.label}` : item.label);
