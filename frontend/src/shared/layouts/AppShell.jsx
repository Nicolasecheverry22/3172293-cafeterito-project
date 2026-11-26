// Armazón común de TODAS las pantallas autenticadas (BEM: app-shell).
// Un único layout para listados, detalles y formularios: al navegar entre ellos no se
// desmonta, así la barra lateral conserva su estado. El tipo de pantalla (listado o
// detalle/formulario) sale de shared/config/navigation.js (getRouteMeta).
//  - < 768px: TopBar con botón de menú + BottomNav; la navegación completa va en un
//    drawer modal (el mismo Sidebar) con scrim, focus trap y scroll del body bloqueado.
//  - 768–1023px: rail fijo. ≥ 1024px: barra lateral expandible/contraíble (se recuerda).
// IdleSessionGuard está por encima, en router.jsx: no se monta aquí.
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Outlet, useLocation } from "react-router-dom";
import usePermission from "@/shared/hooks/usePermission";
import useDialogA11y from "@/shared/hooks/useDialogA11y";
import useNavBadges from "@/shared/hooks/useNavBadges";
import {
  getBottomNavItems,
  getRouteMeta,
  getVisibleSections,
  resolveBadge,
} from "@/shared/config/navigation";
import listBg from "@/assets/images/bg-2.jpg";
import detailBg from "@/assets/images/bg-3.jpg";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
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
  const { can } = usePermission();
  const isTablet = useMediaQuery("(min-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [collapsed, setCollapsed] = useState(readCollapsed);

  // El drawer guarda la ruta en la que se abrió: al navegar (enlace, atrás del
  // navegador...) deja de coincidir y se cierra solo. En ≥ 768px no existe.
  const [drawerPath, setDrawerPath] = useState(null);
  const drawerOpen = drawerPath === pathname && !isTablet;
  const openDrawer = () => setDrawerPath(pathname);
  const closeDrawer = useCallback(() => setDrawerPath(null), []);
  // Escape, foco inicial, Tab atrapado y foco de vuelta al botón que lo abrió
  const drawerRef = useDialogA11y(drawerOpen, closeDrawer);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      // Sin persistencia: el estado dura hasta recargar
    }
  };

  const meta = getRouteMeta(pathname);
  const activeKey = meta.item?.key;
  const sections = getVisibleSections(can);
  const isDetail = meta.back;
  const badges = useNavBadges();
  const getBadge = (item) => resolveBadge(item.badgeKey, badges, can);

  return (
    <div className="app-shell">
      <div className="app-shell__sidebar">
        {/* En 768–1023px siempre es rail (sin botón de expandir: el contenido necesita
            ese ancho); en ≥ 1024px el usuario elige y se recuerda */}
        {isTablet && (
          <Sidebar
            sections={sections}
            activeKey={activeKey}
            getBadge={getBadge}
            rail={!isDesktop || collapsed}
            collapsed={collapsed}
            onToggle={isDesktop ? toggleCollapsed : undefined}
          />
        )}
      </div>

      <div className="app-shell__main">
        <TopBar
          meta={meta}
          onOpenMenu={isTablet ? undefined : openDrawer}
          menuOpen={drawerOpen}
        />

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

      {!isTablet && (
        <>
          <BottomNav
            items={getBottomNavItems(sections)}
            activeKey={activeKey}
            getBadge={getBadge}
            onMore={openDrawer}
            moreOpen={drawerOpen}
          />

          {/* Siempre montado en móvil para animar la entrada/salida; cerrado queda
              inerte (sin foco ni lector de pantalla) */}
          <div className={`app-shell__drawer ${drawerOpen ? "app-shell__drawer--open" : ""}`} inert={!drawerOpen}>
            <div className="app-shell__scrim" onClick={closeDrawer} aria-hidden="true" />
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              tabIndex={-1}
              className="app-shell__drawer-panel"
            >
              <Sidebar sections={sections} activeKey={activeKey} getBadge={getBadge} modal onClose={closeDrawer} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
