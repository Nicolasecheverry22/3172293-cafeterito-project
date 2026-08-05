import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import LoginPage from "@/features/login/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import CreateInventary from "../features/inventory/pages/CreateInventary";
import CreateProveedorPage from "@/features/providers/pages/CreateProveedorPage";
import { UserListPage, UserRegisterForm} from "@/features/users";

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
    children: [
      {
        index: true,
      },
    ],
  },
  {
    path: "/userCreate",
    element: <UserRegisterForm/>,
    children: [
      {
        index: true,
      },
    ],
  },
  {
    path: "/userList",
    element: <UserListPage/>,
    children: [
      {
        index: true,
      },
    ],
  },
  {
    path: "/providerCreate",
    element: <CreateProveedorPage/>,
    children: [
      {
        index: true,
      },
    ],
  },
  {
    path: "/inventoryCreate",
    element: <CreateInventary/>,
    children: [
      {
        index: true,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout/>,
    children: [
      {
        index: true,
      },
    ],
  },

  
  
]);

export default router;