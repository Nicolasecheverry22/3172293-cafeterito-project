// Barra de navegación inferior para móvil (< 768px; BEM: bottom-nav). Patrón M3
// "navigation bar": Inicio + los módulos permitidos de mayor uso + "Más" (abre el drawer
// con la navegación completa). Icono + etiqueta corta, áreas táctiles de 48px.
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { itemAriaLabel } from "@/shared/config/navigation";

export default function BottomNav({ items, activeKey, getBadge = () => null, onMore, moreOpen = false }) {
  // "Más" se resalta cuando la página actual está dentro del drawer
  const moreActive = Boolean(activeKey) && !items.some((item) => item.key === activeKey);

  return (
    <nav aria-label="Navegación inferior" className="bottom-nav">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        const badge = getBadge(item);
        return (
          <Link
            key={item.key}
            to={item.to}
            aria-current={isActive ? "page" : undefined}
            aria-label={itemAriaLabel(item, badge)}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`}
          >
            <span className="bottom-nav__icon">
              <Icon aria-hidden="true" />
              {badge && (
                <span className={`bottom-nav__badge bottom-nav__badge--${badge.tone}`} aria-hidden="true">
                  {badge.text}
                </span>
              )}
            </span>
            <span className="bottom-nav__label">{item.shortLabel ?? item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onMore}
        aria-haspopup="dialog"
        aria-expanded={moreOpen}
        aria-label="Más opciones de navegación"
        className={`bottom-nav__item ${moreActive ? "bottom-nav__item--active" : ""}`}
      >
        <span className="bottom-nav__icon"><Menu aria-hidden="true" /></span>
        <span className="bottom-nav__label">Más</span>
      </button>
    </nav>
  );
}
