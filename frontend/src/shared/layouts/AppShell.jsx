// Armazón común de TODAS las pantallas autenticadas (BEM: app-shell).
// Un único layout para listados, detalles y formularios: al navegar entre ellos no se
// desmonta, así la barra lateral conserva su estado. El tipo de pantalla (listado o
// detalle/formulario) sale de shared/config/navigation.js (getRouteMeta).
// IdleSessionGuard está por encima, en router.jsx: no se monta aquí.
import { useCallback, useState, useSyncExternalStore } from "react";
import { Outlet, useLocation } from "react-router-dom";
import usePermission from "@/shared/hooks/usePermission";
import { getRouteMeta, getVisibleSections } from "@/shared/config/navigation";
import listBg from "@/assets/images/bg-2.jpg";
import detailBg from "@/assets/images/bg-3.jpg";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

const COLLAPSED_KEY = "cafeterito-sidebar-collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false; // almacenamiento bloqueado (modo privado, políticas del navegador)
  }
}

// true/false según la media query; se actualiza al cambiar el ancho de la ventana
function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}

export default function AppShell() {
  const { pathname } = useLocation();
  const isTablet = useMediaQuery("(min-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      // Sin persistencia: el estado dura hasta recargar
    }
  };

  const { can } = usePermission();
  const meta = getRouteMeta(pathname);
  const sections = getVisibleSections(can);
  const isDetail = meta.back;

  return (
    <div className="app-shell">
      <div className="app-shell__sidebar">
        {/* En 768–1023px siempre es rail (sin botón de expandir: el contenido necesita
            ese ancho); en ≥ 1024px el usuario elige y se recuerda */}
        {isTablet && (
          <Sidebar
            sections={sections}
            activeKey={meta.item?.key}
            rail={!isDesktop || collapsed}
            collapsed={collapsed}
            onToggle={isDesktop ? toggleCollapsed : undefined}
          />
        )}
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
