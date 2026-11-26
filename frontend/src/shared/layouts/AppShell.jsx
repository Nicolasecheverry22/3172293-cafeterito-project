// Armazón común de TODAS las pantallas autenticadas (BEM: app-shell).
// Un único layout para listados, detalles y formularios: al navegar entre ellos no se
// desmonta, así la barra lateral conserva su estado. El tipo de pantalla (listado o
// detalle/formulario) sale de shared/config/navigation.js (getRouteMeta).
// IdleSessionGuard está por encima, en router.jsx: no se monta aquí.
import { Outlet, useLocation } from "react-router-dom";
import usePermission from "@/shared/hooks/usePermission";
import { getRouteMeta, getVisibleSections } from "@/shared/config/navigation";
import listBg from "@/assets/images/bg-2.jpg";
import detailBg from "@/assets/images/bg-3.jpg";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

export default function AppShell() {
  const { pathname } = useLocation();
  const { can } = usePermission();
  const meta = getRouteMeta(pathname);
  const sections = getVisibleSections(can);
  const isDetail = meta.back;

  return (
    <div className="app-shell">
      <div className="app-shell__sidebar">
        <Sidebar sections={sections} activeKey={meta.item?.key} />
      </div>

      <div className="app-shell__main">
        <TopBar meta={meta} />

        <main
          id="main-content"
          className={`app-shell__content ${isDetail ? "app-shell__content--detail" : ""}`}
          style={{ "--app-shell-bg": `url(${isDetail ? detailBg : listBg})` }}
        >
          <div className="app-shell__page">
            <Outlet />
          </div>
        </main>

        {/* Pie solo en listados, Inicio, Configuración y Perfil: en formularios y
            detalles distrae de la tarea y empuja los botones de guardar hacia abajo */}
        {!isDetail && <Footer />}
      </div>
    </div>
  );
}
