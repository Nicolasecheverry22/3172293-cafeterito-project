import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import CreateProveedorPage from "../features/providers/pages/CreateProveedorPage";
import LoginPage from "../features/login/pages/LoginPage";

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
            {index: true, element: <h1>Hello1</h1>},
            {
                path: "proveedores/crear",
                element: <CreateProveedorPage />
            }
           
        ],
    },
]);

export default router;
