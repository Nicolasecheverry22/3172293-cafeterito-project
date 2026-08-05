import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import LoginPage from "@/features/login/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import { UserListPage, CreateUserPage } from "@/features/users";
import { ProviderListPage, CreateProviderPage } from "@/features/providers";
import { InventoryListPage, CreateInventoryPage } from "@/features/inventory";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout/>,
    children: [
      {
        index: true,
        element: <LoginPage/>,
      },
    ],
  },
  {
    path: "/home",
    element: <HomePage/>,
  },
  {
    path: "/userCreate",
    element: <CreateUserPage/>,
  },
  {
    path: "/userList",
    element: <UserListPage/>,
  },
  {
    path: "/providerCreate",
    element: <CreateProviderPage/>,
  },
  {
    path: "/providerList",
    element: <ProviderListPage/>,
  },
  {
    path: "/inventoryCreate",
    element: <CreateInventoryPage/>,
  },
  {
    path: "/inventoryList",
    element: <InventoryListPage/>,
  },
  
  
]);

export default router;