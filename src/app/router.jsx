import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout} from "@/shared";
import LoginPage from "@/features/login/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import { UserListPage, CreateUserPage } from "@/features/users";
import { ProviderListPage, CreateProviderPage } from "@/features/providers";
import { InventoryListPage, CreateInventoryPage } from "@/features/inventory";
import { MenuListPage } from "@/features/menu";
// import { OrdensListPage } from "@/features/ordens";
import ForgotPasswordPage from "@/features/login/pages/ForgotPasswordPage";
import VerifyTokenPage from "@/features/login/pages/VerifyTokenPage";
import ResetPasswordPage from "@/features/login/pages/ResetPasswordPage";

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
      {
        path: "recuperar-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "verificar-token",
        element: <VerifyTokenPage />,
      },
      {
        path: "nueva-password",
        element: <ResetPasswordPage />,
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
    path: "/menuList",
    element: <MenuListPage/>,
  },
  // {
  //   path: "/ordensList",
  //   element: <OrdensListPage/>,
  // },
  
  
]);

export default router;