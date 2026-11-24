// Menú por categorías (BEM: menu-picker): chips de categoría + búsqueda + tarjetas de platillo.
import { useMemo, useState } from "react";
import { Plus, Search, UtensilsCrossed, X } from "lucide-react";
import { ImageThumb, QuantityStepper } from "@/shared";
import { ALL_CATEGORIES, MAX_QTY_PER_DISH } from "../config/orderConfig";

const formatCOP = (value) => `$${value.toLocaleString("es-CO")}`;
const normalize = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function MenuPicker({ dishes, isLoading, cart }) {
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [search, setSearch] = useState("");

  // Categorías con su conteo, en orden alfabético
  const categories = useMemo(() => {
    const counts = dishes.reduce((acc, d) => acc.set(d.category, (acc.get(d.category) ?? 0) + 1), new Map());
    const sorted = [...counts].sort(([a], [b]) => a.localeCompare(b, "es"));
    return [[ALL_CATEGORIES, dishes.length], ...sorted];
  }, [dishes]);

  const visible = useMemo(() => {
    const term = normalize(search.trim());
    return dishes.filter(
      (d) =>
        (category === ALL_CATEGORIES || d.category === category) &&
        (!term || normalize(d.productName).includes(term))
    );
  }, [dishes, category, search]);

  return (
    <section className="menu-picker" aria-labelledby="menu-picker-title">
      <h2 id="menu-picker-title" className="order-composer__step-title">
        <span className="order-composer__step-number">2</span> Elige los platillos
      </h2>

      {/* Input simple: SearchField trae su propio <form> y no puede anidarse en el de la orden */}
      <div className="menu-picker__search">
        <Search aria-hidden="true" className="menu-picker__search-icon" />
        <input
          type="search"
          className="menu-picker__search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder="Buscar platillo"
          aria-label="Buscar platillo"
        />
        {search && (
          <button type="button" className="menu-picker__search-clear touch-target" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">
            <X aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="menu-picker__categories" role="toolbar" aria-label="Categorías del menú">
        {categories.map(([name, count]) => (
          <button
            key={name}
            type="button"
            className={`menu-picker__chip ${category === name ? "menu-picker__chip--active" : ""}`}
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            {name} <span className="menu-picker__chip-count">{count}</span>
          </button>
        ))}
      </div>

      {isLoading && <p className="menu-picker__empty">Cargando menú…</p>}
      {!isLoading && visible.length === 0 && (
        <p className="menu-picker__empty">No hay platillos disponibles con ese filtro.</p>
      )}

      <ul className="menu-picker__grid">
        {visible.map((dish) => {
          const qty = cart.quantityOf(dish.id);
          return (
            <li key={dish.id} className={`dish-card ${qty > 0 ? "dish-card--in-cart" : ""}`}>
              <ImageThumb src={dish.productImageThumb} name={dish.productName} icon={UtensilsCrossed} size="md" alt="" />
              <div className="dish-card__info">
                <span className="dish-card__name">{dish.productName}</span>
                <span className="dish-card__price">{formatCOP(dish.price)}</span>
              </div>
              <div className="dish-card__action">
                {qty === 0 ? (
                  <button
                    type="button"
                    className="dish-card__add touch-target"
                    onClick={() => cart.increment(dish.id)}
                    aria-label={`Agregar ${dish.productName}`}
                  >
                    <Plus aria-hidden="true" />
                  </button>
                ) : (
                  <QuantityStepper
                    size="sm"
                    value={qty}
                    max={MAX_QTY_PER_DISH}
                    itemLabel={dish.productName}
                    onIncrement={() => cart.increment(dish.id)}
                    onDecrement={() => cart.decrement(dish.id)}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
