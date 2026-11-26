// Barra lateral de navegación (BEM: sidebar). Patrón M3:
//  - expandida (≥ 1024px): logo, secciones con título, icono + texto y botón Contraer.
//  - rail (contraída en ≥ 1024px, o siempre en 768–1023px): solo iconos con tooltip.
//  - modal (< 768px): dentro del drawer de AppShell, expandida y con botón de cerrar.
// Las secciones llegan ya filtradas por permisos (getVisibleSections).
// Teclado: Tab entra y sale; flechas arriba/abajo, Inicio y Fin se mueven entre ítems.
import { Link } from "react-router-dom";
import { Coffee, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { itemAriaLabel } from "@/shared/config/navigation";

const focusSibling = (e) => {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const items = Array.from(e.currentTarget.querySelectorAll("[data-nav-item]"));
  const index = items.indexOf(document.activeElement);
  if (index === -1) return;
  e.preventDefault();
  const last = items.length - 1;
  const next =
    e.key === "Home" ? 0
    : e.key === "End" ? last
    : e.key === "ArrowDown" ? (index === last ? 0 : index + 1)
    : (index === 0 ? last : index - 1);
  items[next].focus();
};

export default function Sidebar({
  sections,
  activeKey,
  getBadge = () => null, // item → { text, label, tone } | null (useNavBadges)
  rail = false,        // solo iconos
  collapsed = false,   // estado guardado (solo se muestra el botón si onToggle existe)
  onToggle,            // contraer / expandir (solo en ≥ 1024px)
  modal = false,       // dentro del drawer móvil
  onClose,             // cierra el drawer (botón X y al elegir un destino)
}) {
  const classes = ["sidebar", rail && "sidebar--collapsed", modal && "sidebar--modal"].filter(Boolean).join(" ");

  return (
    <nav
      id={modal ? undefined : "sidebar-navigation"}
      aria-label="Navegación principal"
      className={classes}
      onKeyDown={focusSibling}
    >
      <div className="sidebar__header">
        <Link
          to="/home"
          onClick={onClose}
          className="sidebar__brand"
          aria-label="Cafeterito, ir a Inicio"
          title={rail ? "Cafeterito" : undefined}
        >
          <Coffee className="sidebar__brand-icon" aria-hidden="true" />
          <span className="sidebar__label">Cafeterito</span>
        </Link>
        {modal && (
          <button type="button" onClick={onClose} className="sidebar__close" aria-label="Cerrar menú de navegación">
            <X aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="sidebar__sections">
        {sections.map((section) => (
          <div key={section.key} className="sidebar__section">
            {section.title && <p className="sidebar__section-title">{section.title}</p>}
            <ul className="sidebar__list">
              {section.items.map((item) => {
                const isActive = item.key === activeKey;
                const Icon = item.icon;
                const badge = getBadge(item);
                const badgeClass = `sidebar__badge sidebar__badge--${badge?.tone} ${rail ? "sidebar__badge--small" : ""}`;
                return (
                  <li key={item.key}>
                    {/* Link con aria-current manual: NavLink solo marca su propia ruta y
                        el ítem debe quedar activo también en sus rutas hijas (matchPaths) */}
                    <Link
                      to={item.to}
                      onClick={onClose}
                      data-nav-item
                      aria-current={isActive ? "page" : undefined}
                      aria-label={itemAriaLabel(item, badge)}
                      title={rail ? itemAriaLabel(item, badge) : undefined}
                      className={`sidebar__item ${isActive ? "sidebar__item--active" : ""}`}
                    >
                      <span className="sidebar__icon">
                        <Icon aria-hidden="true" />
                        {/* Rail: número pequeño sobre el icono */}
                        {badge && rail && <span className={badgeClass} aria-hidden="true">{badge.text}</span>}
                      </span>
                      <span className="sidebar__label">{item.label}</span>
                      {badge && !rail && <span className={badgeClass} aria-hidden="true">{badge.text}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="sidebar__toggle"
          aria-controls="sidebar-navigation"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          title={collapsed ? "Expandir" : undefined}
        >
          <span className="sidebar__icon">
            {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </span>
          <span className="sidebar__label">{collapsed ? "Expandir" : "Contraer"}</span>
        </button>
      )}
    </nav>
  );
}
