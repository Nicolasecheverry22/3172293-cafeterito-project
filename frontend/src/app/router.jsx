import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout, MainLayout } from "@/shared";

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
} from "@/features/users";
import UserView from "@/features/views/UserView";
import EditUser from "@/features/views/edit/EditUser";

// Providers
import { ProviderListPage, CreateProviderPage } from "@/features/providers";
import ProviderView from "@/features/views/ProviderView";
import EditProvider from "@/features/views/edit/EditProvider";

// Inventory
import { InventoryListPage, CreateInventoryPage } from "@/features/inventory";
import ProvisionsView from "../features/views/ProvisionsView";
import EditProvisions from "../features/views/edit/EditProvisions";

// Menu
import { MenuListPage, CreateMenuPage } from "@/features/menu";
import ProductView from "@/features/views/ProductView";
import EditProduct from "@/features/views/edit/EditProduct";

// Orders
import { OrdensListPage, CreateOrderPage } from "@/features/ordens";
import OrderView from "@/features/views/OrderView";
import EditOrder from "@/features/views/edit/EditOrder";

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

  /* ==================== RUTAS PRINCIPALES / TABLAS (DASHBOARD) ==================== */
  {
    element: <DashboardLayout />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/userList", element: <UserListPage /> },
      { path: "/providerList", element: <ProviderListPage /> },
      { path: "/inventoryList", element: <InventoryListPage /> },
      { path: "/menuList", element: <MenuListPage /> },
      { path: "/ordensList", element: <OrdensListPage /> },
    ],
  },

  /* ==================== RUTAS FORMULARIOS / DETALLES (MAIN LAYOUT) ==================== */
  {
    element: <MainLayout />,
    children: [
      
      { path: "/userCreate", element: <CreateUserPage /> },
      { path: "/UserView/:id", element: <UserView /> },
      { path: "/EditUser/:id", element: <EditUser /> },
      { path: "/permits", element: <PermissionsManagementPage /> },

      
      { path: "/providerCreate", element: <CreateProviderPage /> },
      { path: "/ProviderView/:id", element: <ProviderView /> },
      { path: "/EditProvider/:id", element: <EditProvider /> },
    

      { path: "/inventoryCreate", element: <CreateInventoryPage /> },
      { path: "/InventoryView/:id", element: <ProvisionsView /> },
      { path: "/editInventory/:id", element: <EditProvisions /> },


      { path: "/menuCreate", element: <CreateMenuPage /> },
      { path: "/ProductView/:id", element: <ProductView /> },
      { path: "/EditProduct/:id", element: <EditProduct /> },


      { path: "/ordensCreate", element: <CreateOrderPage /> },
      { path: "/OrderView/:id", element: <OrderView /> },
      { path: "/EditOrder/:id", element: <EditOrder /> },
    ],
  },
]);

export default router;