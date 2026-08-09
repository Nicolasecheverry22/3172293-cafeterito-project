import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import LoginPage from "@/features/login/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import { UserListPage, CreateUserPage } from "@/features/users";
import { ProviderListPage, CreateProviderPage } from "@/features/providers";
import { InventoryListPage, CreateInventoryPage } from "@/features/inventory";
import  ProviderView  from "../features/views/ProviderView";
import  UserView  from "../features/views/UserView";
import  ProductView  from "../features/views/ProductView";
import  EditUser  from "../features/views/edit/EditUser";
import  EditProvider  from "../features/views/edit/EditProvider";

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
  
  {
    path: "/ProviderView",
    element: <ProviderView/>,
  },
  {
    path: "/UserView",
    element: <UserView/>,
  },
  {
    path: "/ProductView",
    element: <ProductView/>,
  },
  {
    path: "/EditUser",
    element: <EditUser/>,
  },
  {
    path: "/EditProvider",
    element: <EditProvider/>,
  },
  
  
]);

export default router;