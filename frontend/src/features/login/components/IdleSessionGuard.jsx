import { Outlet } from "react-router-dom";
import useIdleSession from "../hooks/useIdleSession";

// Ruta padre de TODAS las rutas autenticadas (DashboardLayout y MainLayout, ver router.jsx).
// Al estar por encima de ambos layouts, el control de inactividad se monta una sola vez:
// cambiar de layout no lo desmonta ni reinicia el contador.
export default function IdleSessionGuard() {
  useIdleSession();
  return <Outlet />;
}
