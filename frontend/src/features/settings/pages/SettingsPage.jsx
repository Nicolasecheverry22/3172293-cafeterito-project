// Configuración del restaurante (BEM: settings-card, table-count). Hoy: cantidad de mesas.
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Settings, Armchair } from "lucide-react";
import { Button } from "@/shared";
import { getSettings, updateSettings } from "@/services/settingsApi";
import { getOrders, OPEN_ORDER_STATUSES } from "@/services/orderApi";
import { showConfirmAlert, showSuccessAlert, showSystemErrorAlert } from "@/shared/services/alertService";
import usePermission from "@/shared/hooks/usePermission";

// Mismo rango que el backend (settings.schema.js) y el CHECK de la BD
const MIN_TABLES = 1;
const MAX_TABLES = 200;
const clamp = (n) => Math.min(Math.max(n, MIN_TABLES), MAX_TABLES);

// Visible para todos; sin change_settings queda en solo lectura.
export default function SettingsPage() {
  const { can, guard } = usePermission();
  const canEdit = can("change_settings");
  const canSeeOrders = can("list_order");
  const [saved, setSaved] = useState(null);        // { tableCount, updatedAt, updatedBy }
  const [draft, setDraft] = useState("");           // texto del input (permite borrar y escribir)
  const [occupied, setOccupied] = useState(() => new Set());
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Las mesas ocupadas solo se consultan si el rol puede listar órdenes (evita un 403)
    const orderLists = canSeeOrders ? OPEN_ORDER_STATUSES.map((status) => getOrders({ status })) : [];
    Promise.all([getSettings(), ...orderLists])
      .then(([settings, ...lists]) => {
        setSaved(settings);
        setDraft(String(settings.tableCount));
        setOccupied(new Set(lists.flat().map((o) => Number(o.tableNumber))));
      })
      .catch((err) => setLoadError(err.message));
  }, [canSeeOrders]);

  const value = Number.parseInt(draft, 10);
  const isValid = Number.isInteger(value) && value >= MIN_TABLES && value <= MAX_TABLES;
  const isDirty = saved && isValid && value !== saved.tableCount;

  // Mesas con orden abierta que desaparecerían con el nuevo valor (el backend también lo valida)
  const blocked = useMemo(
    () => (isValid ? [...occupied].filter((n) => n > value).sort((a, b) => a - b) : []),
    [occupied, value, isValid]
  );

  // Vista previa: actuales + nuevas (al aumentar) o retiradas (al reducir)
  const preview = useMemo(() => {
    if (!saved || !isValid) return [];
    const total = Math.max(saved.tableCount, value);
    return Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      let state = "kept";
      if (n > saved.tableCount) state = "added";
      else if (n > value) state = "removed";
      return { n, state, isOccupied: occupied.has(n) };
    });
  }, [saved, value, isValid, occupied]);

  const step = (delta) => setDraft(String(clamp((isValid ? value : saved?.tableCount ?? 1) + delta)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit || !isDirty || blocked.length) return;
    if (value < saved.tableCount) {
      const removed = saved.tableCount - value;
      const { isConfirmed } = await showConfirmAlert({
        title: `¿Reducir de ${saved.tableCount} a ${value} mesas?`,
        text:
          removed === 1
            ? `Se retirará la mesa ${saved.tableCount} y ya no podrá asignarse a nuevas órdenes.`
            : `Se retirarán ${removed} mesas (de la ${value + 1} a la ${saved.tableCount}) y ya no podrán asignarse a nuevas órdenes.`,
        confirmButtonText: "Sí, reducir",
        variant: "warning",
      });
      if (!isConfirmed) return;
    }
    setIsSaving(true);
    try {
      const { settings } = await updateSettings({ tableCount: value });
      setSaved(settings);
      setDraft(String(settings.tableCount));
      await showSuccessAlert({
        title: "Configuración guardada",
        text: `El restaurante ahora tiene ${settings.tableCount} mesas.`,
      });
    } catch (err) {
      await showSystemErrorAlert({
        text: err.status === 403 ? "Solo un administrador puede cambiar la configuración." : err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold font-heading text-text-primary">Configuración del restaurante</h1>
        </div>

        {loadError && <p className="text-error text-sm mb-4">No se pudo cargar la configuración: {loadError}</p>}

        {saved && (
          <form className="settings-card" onSubmit={handleSubmit} noValidate>
            <header className="settings-card__header">
              <Armchair aria-hidden="true" className="settings-card__icon" />
              <div>
                <h2 className="settings-card__title">Mesas</h2>
                <p className="settings-card__hint">
                  Define cuántas mesas aparecen al registrar una orden. Se numeran del 1 al total.
                </p>
                {!canEdit && (
                  <p className="settings-card__readonly" role="note">
                    Solo lectura: tu rol no tiene permiso para modificar la configuración.
                  </p>
                )}
              </div>
            </header>

            <div className="table-count">
              <label htmlFor="tableCount" className="table-count__label">Cantidad de mesas</label>
              <div className="table-count__control">
                <button type="button" className="table-count__btn touch-target" onClick={() => step(-1)}
                  disabled={!canEdit || (isValid && value <= MIN_TABLES)} aria-label="Quitar una mesa">
                  <Minus aria-hidden="true" />
                </button>
                <input
                  id="tableCount"
                  type="number"
                  inputMode="numeric"
                  min={MIN_TABLES}
                  max={MAX_TABLES}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  readOnly={!canEdit}
                  className="table-count__input"
                  aria-invalid={!isValid}
                  aria-describedby="tableCount-help"
                />
                <button type="button" className="table-count__btn touch-target" onClick={() => step(1)}
                  disabled={!canEdit || (isValid && value >= MAX_TABLES)} aria-label="Agregar una mesa">
                  <Plus aria-hidden="true" />
                </button>
              </div>
              <p id="tableCount-help" className={`table-count__help ${!isValid || blocked.length ? "table-count__help--error" : ""}`} role="status">
                {!isValid && `Escribe un número entre ${MIN_TABLES} y ${MAX_TABLES}.`}
                {isValid && blocked.length > 0 &&
                  `No puedes bajar a ${value}: ${blocked.length === 1 ? "la mesa" : "las mesas"} ${blocked.join(", ")} ${blocked.length === 1 ? "tiene" : "tienen"} una orden abierta.`}
                {isValid && !blocked.length && isDirty &&
                  (value > saved.tableCount
                    ? `Se agregarán ${value - saved.tableCount} mesas (de la ${saved.tableCount + 1} a la ${value}).`
                    : `Se retirarán ${saved.tableCount - value} mesas (de la ${value + 1} a la ${saved.tableCount}).`)}
                {isValid && !isDirty && `Actualmente hay ${saved.tableCount} mesas.`}
              </p>
            </div>

            <ul className="table-count__preview" aria-label="Vista previa de las mesas">
              {preview.map(({ n, state, isOccupied }) => (
                <li key={n} className={`table-count__seat table-count__seat--${state} ${isOccupied ? "table-count__seat--busy" : ""}`}
                  title={isOccupied ? `Mesa ${n}: orden abierta` : `Mesa ${n}`}>
                  {n}
                </li>
              ))}
            </ul>
            <p className="table-count__legend">
              <span className="table-count__legend-item table-count__legend-item--added">Nueva</span>
              <span className="table-count__legend-item table-count__legend-item--removed">Se retira</span>
              <span className="table-count__legend-item table-count__legend-item--busy">Con orden abierta</span>
            </p>

            <footer className="settings-card__footer">
              <span className="settings-card__meta">
                {saved.updatedBy ? `Última modificación: ${saved.updatedAt} por ${saved.updatedBy}` : "Valor inicial del sistema"}
              </span>
              <div className="settings-card__actions">
                <Button variant="secondary" disabled={!isDirty || isSaving || !canEdit} onClick={() => setDraft(String(saved.tableCount))}>
                  Descartar
                </Button>
                <Button variant="primary" type="submit" disabled={!isDirty || blocked.length > 0 || isSaving}
                  {...guard("change_settings", "modificar la configuración")}>
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
