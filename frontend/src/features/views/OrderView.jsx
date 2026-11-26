import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Input, Button } from "@/shared";
import { ClipboardList, SquarePen, HandCoins, Receipt } from "lucide-react";
import { getOrderById, OPEN_ORDER_STATUSES } from "@/services/orderApi";
import PaymentModal from "@/features/invoices/components/PaymentModal";
import usePermission from "@/shared/hooks/usePermission";

const STATUS_STYLES = {
  activa: "bg-warning-container text-on-warning-container border-warning/30",
  "lista para entrega": "bg-info-container text-on-info-container border-info/30",
  pagada: "bg-success-container text-on-success-container border-success/30",
  cancelada: "bg-error-container text-on-error-container border-error/30",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (isoDate) => (isoDate ? isoDate.split("-").reverse().join("/") : "-");

export default function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [paying, setPaying] = useState(false);
  const { guard, can } = usePermission();

  const load = useCallback(() => {
    getOrderById(id)
      .then(setOrder)
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) {
    return (
      <div className="min-h-[50vh] w-full flex flex-col">
        <div className="flex items-center gap-3 mt-10 ml-12">
          <ClipboardList className="w-10 h-10 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Visualizar Orden
          </h1>
        </div>
        <p className="ml-12 mt-8 text-error">La orden solicitada no existe.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        <p className="text-text-secondary">Cargando orden...</p>
      </div>
    );
  }

  const status = order.status?.toLowerCase() ?? "";
  const isOpen = OPEN_ORDER_STATUSES.includes(status);

  return (
    <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
      {/* Encabezado Principal */}
      <div className="max-w-7xl w-full mx-auto px-4 mt-4 mb-6 flex items-center gap-3">
        <ClipboardList className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Orden #{order.id}
        </h1>
      </div>

      <div className="max-w-7xl w-full mx-auto px-0 sm:px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* Columna 1: Estado General y Acciones */}
        <div className="bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-6 text-center">
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-text-primary font-heading font-bold text-md">Estado</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                STATUS_STYLES[status] || "bg-surface-muted text-text-primary border-border"
              }`}
            >
              {order.status}
            </span>
            {/* Orden cobrada: enlace a su comprobante de venta */}
            {order.invoiceNumber && can("view_invoice") && (
              <Link
                to={`/InvoiceView/${order.invoiceId}`}
                className="inline-flex items-center gap-2 min-h-touch font-semibold text-text-primary underline underline-offset-4 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
              >
                <Receipt className="w-4 h-4" aria-hidden="true" />
                Comprobante {order.invoiceNumber}
              </Link>
            )}
          </div>

          {isOpen && (
            <div className="w-full flex flex-col gap-3">
              <p className="text-text-primary font-heading font-bold text-md">Acciones</p>
              <Button
                variant="primary"
                type="button"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setPaying(true)}
                {...guard("create_invoice", "cobrar órdenes")}
              >
                <HandCoins className="w-5 h-5" />
                Cobrar
              </Button>
              <Button
                variant="tertiary"
                type="button"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate(`/EditOrder/${order.id}`)}
                {...guard(["update_order", "prepare_order"], "editar órdenes")}
              >
                <SquarePen className="w-5 h-5" />
                Editar Orden
              </Button>
            </div>
          )}
        </div>

        {/* Columnas 2-4: Información Detallada */}
        <div className="lg:col-span-3 bg-surface-muted rounded-shape-xl p-4 sm:p-6 shadow-elevation-1 border border-border/50 flex flex-col items-center gap-6">

          {/* Datos Generales */}
          <div className="w-full bg-surface rounded-shape-lg p-4 sm:p-6 shadow-elevation-1 border border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Número de Mesa" value={`Mesa ${order.tableNumber ?? "-"}`} disabled />
            <Input label="Mesero Asignado" value={order.waiter || "Sin asignar"} disabled />
            <Input label="Fecha" value={formatDate(order.createdAt)} disabled />
            <div className="md:col-span-3">
              <Input label="Observaciones" value={order.observations || "Sin observaciones"} disabled />
            </div>
          </div>

          {/* Tabla de Platillos */}
          <div className="w-full bg-surface rounded-shape-lg p-4 sm:p-6 shadow-elevation-1 border border-border/40 space-y-4">
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Detalle de Platillos
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-text-primary/70 font-semibold">
                    <th className="py-2 px-3">Platillo</th>
                    <th className="py-2 px-3 text-center">Cantidad</th>
                    <th className="py-2 px-3 text-right">Precio Unitario</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/20">
                        <td className="py-3 px-3 font-medium text-text-primary">{item.dish}</td>
                        <td className="py-3 px-3 text-center">{item.quantity}</td>
                        <td className="py-3 px-3 text-right">{formatCurrency(item.price)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-text-primary/60">
                        No hay platillos registrados en esta orden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end items-center pt-4 border-t border-border/40">
              <p className="text-lg font-heading font-bold text-text-primary">
                {/* El total lo calcula la BD (SUM de cantidad × precio de venta) */}
                Total: <span className="text-primary">{formatCurrency(order.total)}</span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {paying && (
        <PaymentModal
          orderId={order.id}
          onClose={() => {
            setPaying(false);
            load();
          }}
        />
      )}
    </div>
  );
}
