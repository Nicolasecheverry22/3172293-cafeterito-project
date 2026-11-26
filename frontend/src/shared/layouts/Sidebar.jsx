// Barra lateral de navegación (BEM: sidebar). Patrón M3:
//  - expandida (≥ 1024px): logo, secciones con título, icono + texto y botón Contraer.
//  - rail (contraída en ≥ 1024px, o siempre en 768–1023px): solo iconos con tooltip.
// Las secciones llegan ya filtradas por permisos (getVisibleSections).
// Teclado: Tab entra y sale; flechas arriba/abajo, Inicio y Fin se mueven entre ítems.
import { Link } from "react-router-dom";
import { Coffee, PanelLeftClose, PanelLeftOpen } from "lucide-react";

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
  rail = false,        // solo iconos
  collapsed = false,   // estado guardado (solo se muestra el botón si onToggle existe)
  onToggle,            // contraer / expandir (solo en ≥ 1024px)
}) {
  return (
    <nav
      id="sidebar-navigation"
      aria-label="Navegación principal"
      className={`sidebar ${rail ? "sidebar--collapsed" : ""}`}
      onKeyDown={focusSibling}
    >
      <Link to="/home" className="sidebar__brand" aria-label="Cafeterito, ir a Inicio" title={rail ? "Cafeterito" : undefined}>
        <Coffee className="sidebar__brand-icon" aria-hidden="true" />
        <span className="sidebar__label">Cafeterito</span>
      </Link>

      <div className="sidebar__sections">
        {sections.map((section) => (
          <div key={section.key} className="sidebar__section">
            {section.title && <p className="sidebar__section-title">{section.title}</p>}
            <ul className="sidebar__list">
              {section.items.map((item) => {
                const isActive = item.key === activeKey;
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    {/* Link con aria-current manual: NavLink solo marca su propia ruta y
                        el ítem debe quedar activo también en sus rutas hijas (matchPaths) */}
                    <Link
                      to={item.to}
                      data-nav-item
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.label}
                      title={rail ? item.label : undefined}
                      className={`sidebar__item ${isActive ? "sidebar__item--active" : ""}`}
                    >
                      <span className="sidebar__icon"><Icon aria-hidden="true" /></span>
                      <span className="sidebar__label">{item.label}</span>
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
