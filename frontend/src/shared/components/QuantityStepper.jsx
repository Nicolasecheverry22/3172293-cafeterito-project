// Selector de cantidad − n + (BEM: qty-stepper). Botones de 40px con área táctil de 48px.
import { Minus, Plus, Trash2 } from "lucide-react";

export default function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  max = 99,
  itemLabel = "",        // nombre del producto para los aria-label
  size = "md",           // sm | md
  className = "",
}) {
  const isLast = value <= 1;
  const DecrementIcon = isLast ? Trash2 : Minus;

  return (
    <div className={`qty-stepper qty-stepper--${size} ${className}`} role="group" aria-label={`Cantidad de ${itemLabel}`}>
      <button
        type="button"
        className={`qty-stepper__btn touch-target ${isLast ? "qty-stepper__btn--danger" : ""}`}
        onClick={onDecrement}
        aria-label={isLast ? `Quitar ${itemLabel}` : `Restar uno de ${itemLabel}`}
      >
        <DecrementIcon aria-hidden="true" />
      </button>
      <output className="qty-stepper__value" aria-live="polite">{value}</output>
      <button
        type="button"
        className="qty-stepper__btn touch-target"
        onClick={onIncrement}
        disabled={value >= max}
        aria-label={`Sumar uno de ${itemLabel}`}
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}
