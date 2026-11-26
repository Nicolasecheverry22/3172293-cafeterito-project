// Barra lateral de navegación (BEM: sidebar). Secciones e ítems ya filtrados por permisos.
import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";

export default function Sidebar({ sections, activeKey }) {
  return (
    <nav aria-label="Navegación principal" className="sidebar">
      <Link to="/home" className="sidebar__brand">
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
                    <Link
                      to={item.to}
                      aria-current={isActive ? "page" : undefined}
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
    </nav>
  );
}
