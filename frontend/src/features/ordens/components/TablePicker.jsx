// Mapa de mesas (BEM: table-picker). Radios nativos: teclado con flechas y lector de pantalla gratis.
import { RefreshCw } from "lucide-react";

export default function TablePicker({ tables, value, onChange, freeCount, isLoading, error, onRefresh }) {
  return (
    <fieldset className="table-picker">
      <div className="table-picker__header">
        <legend className="order-composer__step-title">
          <span className="order-composer__step-number">1</span> Selecciona la mesa
        </legend>
        <button type="button" className="table-picker__refresh touch-target" onClick={onRefresh} aria-label="Actualizar disponibilidad de mesas">
          <RefreshCw aria-hidden="true" className={isLoading ? "table-picker__refresh-icon--spin" : ""} />
        </button>
      </div>

      <p className="table-picker__meta">
        <span className="table-picker__legend table-picker__legend--free">Libre</span>
        <span className="table-picker__legend table-picker__legend--busy">Ocupada</span>
        <span className="table-picker__count">{freeCount} de {tables.length} libres</span>
      </p>

      {error && (
        <p className="order-composer__error" role="alert">
          No se pudo consultar la disponibilidad. Puedes elegir la mesa; el sistema validará al guardar.
        </p>
      )}

      <div className="table-picker__grid">
        {tables.map(({ number, isOccupied }) => {
          const id = `table-${number}`;
          return (
            <label
              key={number}
              htmlFor={id}
              className={[
                "table-picker__table",
                isOccupied && "table-picker__table--busy",
                value === number && "table-picker__table--selected",
              ].filter(Boolean).join(" ")}
            >
              <input
                id={id}
                type="radio"
                name="tableNumber"
                className="table-picker__input"
                value={number}
                checked={value === number}
                disabled={isOccupied}
                onChange={() => onChange(number)}
              />
              <span className="table-picker__number">{number}</span>
              <span className="table-picker__status">
                {isOccupied ? "Ocupada" : value === number ? "✓ Elegida" : "Libre"}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
