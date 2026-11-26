import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, AppShell } from "@/shared";
import ProtectedRoute from "@/shared/components/auth/ProtectedRoute";
import IdleSessionGuard from "@/features/login/components/IdleSessionGuard";

// Auth
import LoginPage from "@/features/login/pages/LoginPage";
import ForgotPasswordPage from "@/features/login/pages/ForgotPasswordPage";
import VerifyTokenPage from "@/features/login/pages/VerifyTokenPage";
import ResetPasswordPage from "@/features/login/pages/ResetPasswordPage";

// Home
import HomePage from "@/features/home/pages/HomePage";

// Users
import {
  UserListPage,
  CreateUserPage,
  PermissionsManagementPage,
  ProfilePage,
} from "@/features/users";
import UserView from "@/features/views/UserView";
import EditUser from "@/features/views/edit/EditUser";

// Providers
import { ProviderListPage, CreateProviderPage } from "@/features/providers";
import ProviderView from "@/features/views/ProviderView";
import EditProvider from "@/features/views/edit/EditProvider";

// Inventory
import { InventoryListPage, CreateInventoryPage } from "@/features/inventory";
import ProvisionsView from "@/features/views/ProvisionsView";
import EditProvisions from "@/features/views/edit/EditProvisions";

// Menu
import { MenuListPage, CreateMenuPage } from "@/features/menu";
import ProductView from "@/features/views/ProductView";
import EditProduct from "@/features/views/edit/EditProduct";

// Orders
import { OrdensListPage, CreateOrderPage } from "@/features/ordens";
import { SettingsPage } from "@/features/settings";
import OrderView from "@/features/views/OrderView";
import EditOrder from "@/features/views/edit/EditOrder";

// Invoices (comprobantes de venta)
import { InvoiceListPage } from "@/features/invoices";
import InvoiceView from "@/features/views/InvoiceView";

// Cada módulo declara su permiso: sin él, ProtectedRoute muestra "Sin acceso" (el backend
// responde 403 de todas formas). /home y /settings son visibles para cualquier usuario.
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },

  /* ==================== RUTAS PÚBLICAS / AUTÉNTICACIÓN ==================== */
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "resetPassword", element: <ForgotPasswordPage /> },
      { path: "verifyToken", element: <VerifyTokenPage /> },
      { path: "newPassword", element: <ResetPasswordPage /> },
    ],
  },

  /* ==================== RUTAS PRIVADAS ==================== */
  // Un solo control de sesión por inactividad (IdleSessionGuard) para todas las rutas
  // autenticadas: está por encima del layout (AppShell), así que navegar no lo
  // desmonta ni reinicia el contador. Nunca envuelve las rutas de /auth.
  {
    element: (
      <ProtectedRoute>
        <IdleSessionGuard />
      </ProtectedRoute>
    ),
    children: [
      /* ==================== RUTAS PRIVADAS (AppShell) ==================== */
      // Un solo layout para listados, detalles y formularios: barra lateral, superior e
      // inferior (móvil). La configuración de cada ruta (ítem activo, título, "Volver",
      // fondo) vive en shared/config/navigation.js: al agregar una ruta, regístrala allí.
      {
        element: <AppShell />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/userList", element: <ProtectedRoute permission="list_user"><UserListPage /></ProtectedRoute> },
          { path: "/providerList", element: <ProtectedRoute permission="list_provider"><ProviderListPage /></ProtectedRoute> },
          { path: "/inventoryList", element: <ProtectedRoute permission="list_inventory"><InventoryListPage /></ProtectedRoute> },
          { path: "/menuList", element: <ProtectedRoute permission="list_product"><MenuListPage /></ProtectedRoute> },
          { path: "/ordensList", element: <ProtectedRoute permission="list_order"><OrdensListPage /></ProtectedRoute> },
          { path: "/settings", element: <SettingsPage /> },
          // Mi perfil: cualquier usuario autenticado
          { path: "/profile", element: <ProfilePage /> },
          { path: "/invoiceList", element: <ProtectedRoute permission="list_invoice"><InvoiceListPage /></ProtectedRoute> },
          { path: "/userCreate", element: <ProtectedRoute permission="create_user"><CreateUserPage /></ProtectedRoute> },
          { path: "/UserView/:id", element: <ProtectedRoute permission="view_user"><UserView /></ProtectedRoute> },
          { path: "/EditUser/:id", element: <ProtectedRoute permission="update_user"><EditUser /></ProtectedRoute> },
          { path: "/permits", element: <ProtectedRoute permission="manage_permissions"><PermissionsManagementPage /></ProtectedRoute> },
          { path: "/providerCreate", element: <ProtectedRoute permission="create_provider"><CreateProviderPage /></ProtectedRoute> },
          { path: "/ProviderView/:id", element: <ProtectedRoute permission="view_provider"><ProviderView /></ProtectedRoute> },
          { path: "/EditProvider/:id", element: <ProtectedRoute permission="update_provider"><EditProvider /></ProtectedRoute> },
          { path: "/inventoryCreate", element: <ProtectedRoute permission="create_inventory"><CreateInventoryPage /></ProtectedRoute> },
          { path: "/InventoryView/:id", element: <ProtectedRoute permission="view_inventory"><ProvisionsView /></ProtectedRoute> },
          { path: "/editInventory/:id", element: <ProtectedRoute permission="update_inventory"><EditProvisions /></ProtectedRoute> },
          { path: "/menuCreate", element: <ProtectedRoute permission="create_product"><CreateMenuPage /></ProtectedRoute> },
          { path: "/ProductView/:id", element: <ProtectedRoute permission="view_product"><ProductView /></ProtectedRoute> },
          { path: "/EditProduct/:id", element: <ProtectedRoute permission="update_product"><EditProduct /></ProtectedRoute> },
          { path: "/ordensCreate", element: <ProtectedRoute permission="create_order"><CreateOrderPage /></ProtectedRoute> },
          { path: "/OrderView/:id", element: <ProtectedRoute permission="view_order"><OrderView /></ProtectedRoute> },
          { path: "/EditOrder/:id", element: <ProtectedRoute permission={["update_order", "prepare_order"]}><EditOrder /></ProtectedRoute> },
          { path: "/InvoiceView/:id", element: <ProtectedRoute permission="view_invoice"><InvoiceView /></ProtectedRoute> },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/auth" replace />,
  },
]);

export default router;