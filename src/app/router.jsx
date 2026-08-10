import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout} from "@/shared";
import LoginPage from "@/features/login/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import ForgotPasswordPage from "@/features/login/pages/ForgotPasswordPage";
import VerifyTokenPage from "@/features/login/pages/VerifyTokenPage";
import ResetPasswordPage from "@/features/login/pages/ResetPasswordPage";
import { UserListPage, CreateUserPage,PermissionsManagementPage } from "@/features/users";
import { ProviderListPage, CreateProviderPage } from "@/features/providers";
import { InventoryListPage, CreateInventoryPage } from "@/features/inventory";
import  ProviderView  from "../features/views/ProviderView";
import  UserView  from "../features/views/UserView";
import  ProductView  from "../features/views/ProductView";
import  EditUser  from "../features/views/edit/EditUser";
import  EditProvider  from "../features/views/edit/EditProvider";
import { MenuListPage, CreateMenuPage } from "@/features/menu";
import { OrdensListPage, CreateOrderPage } from "@/features/ordens";

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
        path: "recoverPassword",
        element: <ForgotPasswordPage />,
      },
      {
        path: "verifyToken",
        element: <VerifyTokenPage />,
      },
      {
        path: "newPassword",
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
  
  {
    path: "/menuCreate",
    element: <CreateMenuPage/>,
  },
  {
    path: "/menuList",
    element: <MenuListPage/>,
  },
  {
    path: "/ordensCreate",
    element: <CreateOrderPage/>,
  },
  {
    path: "/ordensList",
    element: <OrdensListPage/>,
  },
  {
    path: "/permits",
    element: <PermissionsManagementPage/>,
  },

]);

export default router;