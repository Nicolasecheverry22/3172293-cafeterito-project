import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import CreateProveedorPage from "../features/providers/pages/CreateProveedorPage";
import CreateInventary from "../features/providers/pages/CreateInventary";
import LoginPage from "../features/login/pages/LoginPage";
import { UserListPage, UserRegisterForm } from "@/features/users";
import HomePage from "../features/home/pages/HomePage";
import Navbar from "../shared/layouts/Navbar";


const router = createBrowserRouter ([
    {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: "/auth",
        element: <AuthLayout/>,
        children:[
            {
                index: true, 
                element: <LoginPage />
            },
        ],
    },
    {
        path: "/dashboard",
        element: <DashboardLayout/>,
        children: [
            {index: true, },
            {path: "/dashboard/userCreate", element: <UserRegisterForm/>},
            {path: "/dashboard/userList", element: <UserListPage/>},
            {path: "/dashboard/homePage", element: <HomePage/>},
        ],
    },
    {
        path: "/dashboard",
        element: <DashboardLayout/>,
        children: [
            {   
                index: true,
                path: "proveedores/crear",
                element: <CreateProveedorPage />
            }
        ]
    },
      {
         path: "/inventary",
         element: <CreateInventary/>,
         children: [
              {index: true, element: <h1>Hello1</h1>},
              {path: "auth", element: <h1>Hello2</h1>},     
              {path: "userList", element: <h1>Hello3</h1>},
         ],
     },
]);

export default router;
