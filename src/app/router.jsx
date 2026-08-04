import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import LoginPage from "@/features/login/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import CreateInventary from "@/features/providers/pages/CreateInventary";
import CreateProveedorPage from "@/features/providers/pages/CreateProveedorPage";
import { UserListPage, UserRegisterForm} from "@/features/users";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },

  // Rutas Dashboard 
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />, 
      },
      {
        path: "homePage",
        element: <HomePage />,
      },
      {
        path: "users",
        children: [
          { index: true, element: <UserListPage /> }, 
          { path: "create", element: <UserRegisterForm /> }, 
        ],
      },
      {
        path: "userCreate",
        element: <UserRegisterForm />, 
      },
      {
        path: "userList",
        element: <UserListPage />, 
      },
      // Módulo Proveedores
      {
        path: "proveedores/crear",
        element: <CreateProveedorPage />, 
      },
      {
        path: "inventario/crear",
        element: <CreateInventary />,
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;