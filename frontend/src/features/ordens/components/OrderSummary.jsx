// Resumen de la orden (BEM: order-summary): mesa, líneas editables, observaciones y total.
import { ShoppingBasket, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/shared";
import { MAX_QTY_PER_DISH } from "../config/orderConfig";

const formatCOP = (value) => `$${value.toLocaleString("es-CO")}`;

export default function OrderSummary({ tableNumber, cart, observations, onObservationsChange, errors }) {
  return (
    <section className="order-summary" aria-labelledby="order-summary-title">
      <header className="order-summary__header">
        <h2 id="order-summary-title" className="order-composer__step-title">
          <span className="order-composer__step-number">3</span> Revisa la orden
        </h2>
        <span className={`order-summary__table ${tableNumber ? "" : "order-summary__table--empty"}`}>
          {tableNumber ? `Mesa ${tableNumber}` : "Sin mesa"}
        </span>
      </header>
      {errors.tableNumber && <p className="order-composer__error" role="alert">{errors.tableNumber}</p>}

      {cart.detailed.length === 0 ? (
        <div className="order-summary__empty">
          <ShoppingBasket aria-hidden="true" />
          <p>Agrega platillos desde el menú</p>
        </div>
      ) : (
        <ul className="order-summary__lines">
          {cart.detailed.map(({ productId, quantity, dish, subtotal }) => (
            <li key={productId} className="order-summary__line">
              <div className="order-summary__line-info">
                <span className="order-summary__line-name">{dish.productName}</span>
                <span className="order-summary__line-unit">{formatCOP(dish.price)} c/u</span>
              </div>
              <QuantityStepper
                size="sm"
                value={quantity}
                max={MAX_QTY_PER_DISH}
                itemLabel={dish.productName}
                onIncrement={() => cart.increment(productId)}
                onDecrement={() => cart.decrement(productId)}
              />
              <span className="order-summary__line-subtotal">{formatCOP(subtotal)}</span>
            </li>
          ))}
        </ul>
      )}
      {errors.items && <p className="order-composer__error" role="alert">{errors.items}</p>}

      {cart.detailed.length > 0 && (
        <button type="button" className="order-summary__clear" onClick={cart.clear}>
          <Trash2 aria-hidden="true" /> Vaciar orden
        </button>
      )}

      <label className="order-summary__notes">
        <span className="order-summary__notes-label">Observaciones</span>
        <textarea
          name="observations"
          rows={2}
          maxLength={300}
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Ej: sin cebolla, para llevar, alergias..."
          className="order-summary__notes-input"
        />
        <span className="order-summary__notes-count">{observations.length}/300</span>
      </label>
      {errors.observations && <p className="order-composer__error" role="alert">{errors.observations}</p>}

      <div className="order-summary__total">
        <span>Total · {cart.totalItems} {cart.totalItems === 1 ? "platillo" : "platillos"}</span>
        <strong>{formatCOP(cart.total)}</strong>
      </div>
    </section>
  );
}
