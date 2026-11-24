// Registrar y editar orden con el mismo diseño (BEM: order-composer): mesa → platillos → resumen.
// - Crear: el empleado encargado es el usuario en sesión (el backend lo toma del token).
// - Editar: precarga la orden; estado con SOLO las transiciones permitidas (sin "pagada":
//   se paga con Cobrar), mesero editable solo por administración, confirmación al quitar
//   un platillo, indicador de cambios sin guardar, descartar y aviso al salir.
//   Con solo prepare_order (cocina) únicamente se puede cambiar activa ↔ lista para entrega.
// El total se muestra en vivo; el servidor recalcula los precios al guardar.
import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { HandCoins, RotateCcw, CircleDot } from "lucide-react";
import { Button, Select } from "@/shared";
import { getSessionUser } from "@/services/apiClient";
import { ORDER_TRANSITIONS, ORDER_STATUS_LABELS } from "@/services/orderApi";
import usePermission from "@/shared/hooks/usePermission";
import { showConfirmDeleteAlert } from "@/shared/services/alertService";
import { createOrderSchema } from "../schemas/orderSchema";
import useTableAvailability from "../hooks/useTableAvailability";
import useOrderCart from "../hooks/useOrderCart";
import TablePicker from "./TablePicker";
import WaiterBadge from "./WaiterBadge";
import MenuPicker from "./MenuPicker";
import OrderSummary from "./OrderSummary";

const formatCOP = (value) => `$${value.toLocaleString("es-CO")}`;
const EMPTY_INITIAL = { tableNumber: null, observations: "", items: [], status: "activa", waiterId: null };

// Clave estable del carrito para detectar cambios (independiente del orden de las líneas)
const cartKey = (lines) =>
  lines.map((l) => `${l.productId}x${l.quantity}`).sort().join(",");

export default function OrderComposer({
  mode = "create",
  dishes = [],            // platillos disponibles para agregar (menú)
  catalog,                // catálogo para precios/nombres del resumen (por defecto = dishes)
  isLoadingDishes = false,
  initial = EMPTY_INITIAL,
  order = null,           // editar: { id, status, waiter, waiterId, tableNumber }
  waiters = null,         // editar: opciones { value, label } (solo si puede reasignar)
  onSubmit,
  onCancel,
  onCharge,
}) {
  const isEdit = mode === "edit";
  const { can, guard } = usePermission();

  const canUpdate = !isEdit || can("update_order");
  const onlyPrepare = isEdit && !canUpdate && can("prepare_order");
  const canCancel = can("cancel_order");
  const canChangeWaiter = isEdit && canUpdate && can("manage_permissions") && Array.isArray(waiters);

  const [tableNumber, setTableNumber] = useState(initial.tableNumber);
  const [observations, setObservations] = useState(initial.observations ?? "");
  const [status, setStatus] = useState(initial.status ?? "activa");
  const [waiterId, setWaiterId] = useState(initial.waiterId ? String(initial.waiterId) : "");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availability = useTableAvailability();
  const baseCart = useOrderCart(catalog ?? dishes, initial.items);
  const sessionUser = getSessionUser();

  // La mesa actual de la orden que se edita cuenta como libre
  const tables = useMemo(
    () =>
      availability.tables.map((t) =>
        isEdit && t.number === initial.tableNumber ? { ...t, isOccupied: false } : t
      ),
    [availability.tables, isEdit, initial.tableNumber]
  );
  const freeCount = tables.filter((t) => !t.isOccupied).length;

  // Si otro mesero ocupa la mesa elegida mientras se arma la orden, la selección se anula.
  const selectedTaken = tables.some((t) => t.number === tableNumber && t.isOccupied);
  const selectedTable = selectedTaken ? null : tableNumber;
  const visibleErrors = selectedTaken
    ? { ...errors, tableNumber: "La mesa que elegiste acaba de ocuparse. Elige otra." }
    : errors;

  // Al editar, quitar el último de un platillo pide confirmación (mínimo 1 con el stepper)
  const cart = useMemo(() => {
    if (!isEdit) return baseCart;
    return {
      ...baseCart,
      decrement: async (productId) => {
        if (baseCart.quantityOf(productId) > 1) return baseCart.decrement(productId);
        const name = (catalog ?? dishes).find((d) => d.id === productId)?.productName ?? "este platillo";
        const { isConfirmed } = await showConfirmDeleteAlert({
          title: "¿Quitar platillo?",
          text: `Se quitará "${name}" de la orden.`,
          confirmButtonText: "Sí, quitar",
          cancelButtonText: "No, conservar",
        });
        if (isConfirmed) baseCart.remove(productId);
      },
    };
  }, [baseCart, isEdit, catalog, dishes]);

  // ── Cambios sin guardar ──────────────────────────────────────
  const initialKey = useMemo(() => cartKey(initial.items), [initial.items]);
  const isDirty =
    isEdit &&
    (tableNumber !== initial.tableNumber ||
      observations.trim() !== (initial.observations ?? "").trim() ||
      status !== initial.status ||
      (canChangeWaiter && waiterId !== String(initial.waiterId ?? "")) ||
      cartKey(baseCart.lines) !== initialKey);

  // Aviso al salir con cambios pendientes: navegación interna (useBlocker) y cierre/recarga
  const dirtyRef = useRef(false);
  const allowLeaveRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isEdit && dirtyRef.current && !allowLeaveRef.current &&
      currentLocation.pathname !== nextLocation.pathname
  );
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    showConfirmDeleteAlert({
      title: "¿Salir sin guardar?",
      text: "Tienes cambios sin guardar en esta orden. Si sales, se perderán.",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Seguir editando",
    }).then(({ isConfirmed }) => (isConfirmed ? blocker.proceed() : blocker.reset()));
  }, [blocker]);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const discardChanges = () => {
    setTableNumber(initial.tableNumber);
    setObservations(initial.observations ?? "");
    setStatus(initial.status);
    setWaiterId(initial.waiterId ? String(initial.waiterId) : "");
    baseCart.reset(initial.items);
    setErrors({});
  };

  const selectTable = (number) => {
    setTableNumber(number);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.tableNumber;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !isDirty) return;
    const result = createOrderSchema().safeParse({ tableNumber: selectedTable, observations, items: baseCart.lines });
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }

    if (isEdit && status === "cancelada" && initial.status !== "cancelada") {
      const { isConfirmed } = await showConfirmDeleteAlert({
        title: "¿Anular la orden?",
        text: `La orden #${order.id} quedará cancelada. Esta acción no se puede deshacer.`,
        confirmButtonText: "Sí, anular",
        cancelButtonText: "No",
      });
      if (!isConfirmed) return;
    }

    setErrors({});
    setIsSubmitting(true);
    allowLeaveRef.current = true; // el padre navega al guardar
    try {
      const payload = isEdit
        ? {
            ...result.data,
            status,
            ...(canChangeWaiter && waiterId && { waiterId: Number(waiterId) }),
          }
        : result.data;
      const ok = await onSubmit(payload);
      if (!ok) {
        allowLeaveRef.current = false;
        // Si falló (p. ej. 409 mesa ocupada) se refresca el mapa para ver el estado real
        availability.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = formatCOP(cart.total);
  const statusOptions = isEdit ? ORDER_TRANSITIONS[initial.status] ?? [] : [];
  const submitDisabled = isSubmitting || (isEdit && !isDirty);
  const submitLabel = isSubmitting
    ? "Guardando..."
    : isEdit ? `Guardar cambios · ${total}` : `Crear orden · ${total}`;

  const chargeButton = isEdit && onCharge && (
    <Button
      variant="tertiary"
      onClick={onCharge}
      className="gap-2"
      disabled={isDirty}
      title={isDirty ? "Guarda o descarta los cambios antes de cobrar" : "Cobrar la orden"}
      {...guard("create_invoice", "cobrar órdenes")}
    >
      <HandCoins className="size-5" aria-hidden="true" /> Cobrar
    </Button>
  );

  return (
    <form onSubmit={handleSubmit} className="order-composer" noValidate>
      <div className="order-composer__main">
        {isEdit ? (
          <section className="order-edit" aria-label="Datos de la orden">
            <fieldset className="order-status">
              <legend className="order-status__legend">Estado de la orden</legend>
              <div className="order-status__options" role="radiogroup">
                {statusOptions.map((value) => {
                  const deniedCancel = value === "cancelada" && !canCancel;
                  const deniedOther = !canUpdate && !onlyPrepare;
                  const isDisabled = deniedCancel || deniedOther;
                  return (
                    <label
                      key={value}
                      className={[
                        "order-status__option",
                        `order-status__option--${value.replace(/\s+/g, "-")}`,
                        status === value && "order-status__option--active",
                        isDisabled && "order-status__option--disabled",
                      ].filter(Boolean).join(" ")}
                      title={deniedCancel ? "No tienes permiso para anular órdenes" : undefined}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={value}
                        className="order-status__input"
                        checked={status === value}
                        disabled={isDisabled}
                        aria-disabled={isDisabled || undefined}
                        onChange={() => setStatus(value)}
                      />
                      <CircleDot aria-hidden="true" className="order-status__icon" />
                      {ORDER_STATUS_LABELS[value]}
                      {value === initial.status && <span className="order-status__current">(actual)</span>}
                    </label>
                  );
                })}
              </div>
              {onlyPrepare && (
                <p className="order-status__hint">
                  Tu rol solo puede marcar la orden como activa o lista para entrega.
                </p>
              )}
            </fieldset>

            {canChangeWaiter ? (
              <div className="order-edit__waiter">
                <Select
                  label="Mesero encargado"
                  htmlFor="order-waiter"
                  value={waiterId}
                  onChange={(e) => setWaiterId(e.target.value)}
                  options={waiters}
                />
              </div>
            ) : (
              <WaiterBadge user={{ name: order?.waiter }} />
            )}
          </section>
        ) : (
          <WaiterBadge user={sessionUser} />
        )}

        <TablePicker
          tables={tables}
          value={selectedTable}
          onChange={selectTable}
          freeCount={freeCount}
          isLoading={availability.isLoading}
          error={availability.error}
          onRefresh={availability.refresh}
          currentTable={isEdit ? initial.tableNumber : null}
          disabled={!canUpdate}
        />
        <MenuPicker dishes={dishes} isLoading={isLoadingDishes} cart={cart} disabled={!canUpdate} />
      </div>

      <aside className="order-composer__aside">
        <OrderSummary
          tableNumber={selectedTable}
          cart={cart}
          observations={observations}
          onObservationsChange={setObservations}
          errors={visibleErrors}
          readOnly={!canUpdate}
          allowClear={!isEdit}
        />
        {isEdit && (
          <p className={`order-composer__dirty ${isDirty ? "order-composer__dirty--on" : ""}`} role="status">
            {isDirty ? "Cambios sin guardar" : "Sin cambios"}
          </p>
        )}
        <div className="order-composer__actions">
          {isEdit ? (
            <Button variant="secondary" onClick={discardChanges} disabled={!isDirty || isSubmitting} className="gap-2">
              <RotateCcw className="size-4" aria-hidden="true" /> Descartar cambios
            </Button>
          ) : (
            <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          )}
          <Button variant="primary" type="submit" disabled={submitDisabled} className="order-composer__submit">
            {submitLabel}
          </Button>
        </div>
        {chargeButton && <div className="order-composer__charge">{chargeButton}</div>}
      </aside>

      {/* Barra fija en móvil: total y envío siempre a la vista */}
      <div className="order-composer__mobile-bar">
        <div className="order-composer__mobile-total">
          <span>
            {selectedTable ? `Mesa ${selectedTable}` : "Sin mesa"} · {cart.totalItems} platillos
            {isDirty && <span className="order-composer__mobile-dirty"> · sin guardar</span>}
          </span>
          <strong>{total}</strong>
        </div>
        {isEdit && (
          <Button variant="secondary" onClick={discardChanges} disabled={!isDirty || isSubmitting} aria-label="Descartar cambios">
            <RotateCcw className="size-4" aria-hidden="true" />
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={submitDisabled}>
          {isSubmitting ? "Guardando..." : isEdit ? "Guardar" : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}
