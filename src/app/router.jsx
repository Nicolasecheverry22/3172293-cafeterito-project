import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout, MainLayout } from "@/shared";
import LoginPage from "@/features/login/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import ForgotPasswordPage from "@/features/login/pages/ForgotPasswordPage";
import VerifyTokenPage from "@/features/login/pages/VerifyTokenPage";
import ResetPasswordPage from "@/features/login/pages/ResetPasswordPage";
import { UserListPage, CreateUserPage, PermissionsManagementPage } from "@/features/users";
import { ProviderListPage, CreateProviderPage } from "@/features/providers";
import { InventoryListPage, CreateInventoryPage } from "@/features/inventory";
import ProviderView from "../features/views/ProviderView";
import UserView from "../features/views/UserView";
import ProductView from "../features/views/ProductView";
import ProvisionsView from "../features/views/ProvisionsView";
import EditUser from "../features/views/edit/EditUser";
import EditProvider from "../features/views/edit/EditProvider";
import EditProduct from "../features/views/edit/EditProduct";
import { MenuListPage, CreateMenuPage } from "@/features/menu";
import { OrdensListPage, CreateOrderPage } from "@/features/ordens";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
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
  },{
    element: <MainLayout />, 
    children: [
      { path: "/userCreate", element: <CreateUserPage /> },
      { path: "/providerCreate", element: <CreateProviderPage /> },
      { path: "/inventoryCreate", element: <CreateInventoryPage /> },
      { path: "/ProviderView/:id", element: <ProviderView /> },
      { path: "/ProductView/:id", element: <ProductView /> },
      { path: "/ProvisionsView/:id", element: <ProvisionsView /> },
      { path: "/UserView/:id", element: <UserView /> },
      { path: "/EditUser/:id", element: <EditUser /> },
      { path: "/EditProduct/:id", element: <EditProduct /> },
      { path: "/EditProvider/:id", element: <EditProvider /> },
      { path: "/EditProduct/:id", element: <EditProduct /> },
      { path: "/menuCreate", element: <CreateMenuPage /> },
      { path: "/ordensCreate", element: <CreateOrderPage /> },
      { path: "/permits", element: <PermissionsManagementPage /> },
    ],
  },
]);

export default router;


