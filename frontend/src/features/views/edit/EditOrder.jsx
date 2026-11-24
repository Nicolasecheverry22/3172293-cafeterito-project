// Editar orden con el mismo diseño que registrarla (OrderComposer en modo "edit").
// Orden pagada o cancelada → vista de solo lectura con enlace a su comprobante.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Receipt, Eye, Lock } from "lucide-react";
import { Button } from "@/shared";
import OrderComposer from "@/features/ordens/components/OrderComposer";
import PaymentModal from "@/features/invoices/components/PaymentModal";
import { getOrderById, updateOrder, OPEN_ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/services/orderApi";
import { getProducts } from "@/services/productApi";
import { getUsers } from "@/services/userApi";
import usePermission from "@/shared/hooks/usePermission";
import { showSystemErrorAlert, showSuccessAlert } from "@/shared/services/alertService";

const formatCOP = (value) => `$${Number(value ?? 0).toLocaleString("es-CO")}`;

export default function EditOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = usePermission();
  // Reasignar el mesero es de administración (el backend exige update_order + manage_permissions)
  const canChangeWaiter = can("update_order") && can("manage_permissions") && can("list_user");

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [waiters, setWaiters] = useState(null);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);
  const [paying, setPaying] = useState(false);
  const [version, setVersion] = useState(0); // remonta el compositor tras recargar la orden

  const loadOrder = useCallback(
    () =>
      getOrderById(id)
        .then((data) => {
          setOrder(data);
          setVersion((v) => v + 1);
        })
        .catch(() =>
          showSystemErrorAlert({ text: "La orden que intentas editar no existe." })
            .then(() => navigate("/ordensList", { replace: true }))
        ),
    [id, navigate]
  );

  useEffect(() => {
    loadOrder();
    getProducts()
      .then(setProducts)
      .catch(() => showSystemErrorAlert({ text: "No se pudo cargar el menú." }))
      .finally(() => setIsLoadingDishes(false));
  }, [loadOrder]);

  useEffect(() => {
    if (!canChangeWaiter || !order) return;
    getUsers({ isActive: true })
      .then((users) => {
        const options = users.map((u) => ({ value: String(u.id), label: u.userName }));
        // El mesero actual aunque esté inactivo, para no perderlo de la lista
        if (order.waiterId && !options.some((o) => o.value === String(order.waiterId))) {
          options.unshift({ value: String(order.waiterId), label: `${order.waiter} (inactivo)` });
        }
        setWaiters(options);
      })
      .catch(() => setWaiters(null));
  }, [canChangeWaiter, order]);

  // Catálogo para el resumen: los platillos que ya estaban conservan el precio guardado en la
  // orden (el backend también lo conserva) y aparecen aunque hoy estén inhabilitados.
  const { catalog, menu } = useMemo(() => {
    if (!order) return { catalog: [], menu: [] };
    const stored = new Map(order.items.map((i) => [i.productId, i]));
    const merged = products.map((p) =>
      stored.has(p.id) ? { ...p, price: stored.get(p.id).price } : p
    );
    for (const item of order.items) {
      if (!merged.some((p) => p.id === item.productId)) {
        merged.push({ id: item.productId, productName: item.dish, price: item.price, category: "Sin categoría", isAvailable: false });
      }
    }
    return { catalog: merged, menu: merged.filter((p) => p.isAvailable) };
  }, [order, products]);

  const initial = useMemo(
    () =>
      order && {
        tableNumber: order.tableNumber,
        observations: order.observations ?? "",
        status: order.status,
        waiterId: order.waiterId,
        items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
    [order]
  );

  if (!order || !initial) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        <p className="bg-background/90 rounded-shape-lg px-4 py-2 text-text-secondary">Cargando orden...</p>
      </div>
    );
  }

  const isOpen = OPEN_ORDER_STATUSES.includes(order.status);

  const handleSave = async (data) => {
    try {
      // Solo ids y cantidades: el backend conserva el precio de los platillos que ya estaban
      await updateOrder(order.id, { ...data, observations: data.observations ?? "" });
      await showSuccessAlert({ title: "¡Orden actualizada!", text: "Los cambios fueron guardados correctamente." });
      navigate("/ordensList");
      return true;
    } catch (error) {
      await showSystemErrorAlert({ text: error.message || "Los cambios no pudieron guardarse." });
      return false;
    }
  };

  return (
    <div className="bg-background/95 rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="order-edit__title">
          <Pencil className="w-8 h-8 text-text-primary shrink-0" aria-hidden="true" />
          <h1 className="text-title font-heading text-text-primary">Editar orden #{order.id}</h1>
          <span className={`order-edit__badge order-edit__badge--${order.status.replace(/\s+/g, "-")}`}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        {isOpen ? (
          <OrderComposer
            key={version}
            mode="edit"
            order={order}
            initial={initial}
            dishes={menu}
            catalog={catalog}
            isLoadingDishes={isLoadingDishes}
            waiters={canChangeWaiter ? waiters : null}
            onSubmit={handleSave}
            onCharge={() => setPaying(true)}
          />
        ) : (
          // Pagada o cancelada: estado final, solo lectura
          <section className="order-readonly" aria-labelledby="order-readonly-title">
            <p id="order-readonly-title" className="order-readonly__title">
              <Lock className="size-5" aria-hidden="true" />
              Esta orden está {order.status} y ya no se puede modificar.
            </p>
            <dl className="order-readonly__facts">
              <div><dt>Mesa</dt><dd>{order.tableNumber}</dd></div>
              <div><dt>Mesero</dt><dd>{order.waiter}</dd></div>
              <div><dt>Total</dt><dd>{formatCOP(order.total)}</dd></div>
            </dl>
            <ul className="order-readonly__lines">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>{item.quantity} × {item.dish}</span>
                  <span>{formatCOP(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            {order.observations && <p className="order-readonly__notes">Observaciones: {order.observations}</p>}
            <div className="order-readonly__actions">
              <Button as={Link} to={`/OrderView/${order.id}`} variant="secondary" className="gap-2">
                <Eye className="size-4" aria-hidden="true" /> Ver orden
              </Button>
              {order.invoiceId && (
                <Button
                  as={Link}
                  to={`/InvoiceView/${order.invoiceId}`}
                  variant="primary"
                  className="gap-2"
                  {...(can("view_invoice") ? {} : { disabled: true, "aria-disabled": true, title: "No tienes permiso para ver comprobantes" })}
                >
                  <Receipt className="size-4" aria-hidden="true" /> Comprobante {order.invoiceNumber}
                </Button>
              )}
            </div>
          </section>
        )}
      </div>

      {paying && (
        <PaymentModal
          orderId={order.id}
          onClose={() => {
            setPaying(false);
            loadOrder();
          }}
        />
      )}
    </div>
  );
}
