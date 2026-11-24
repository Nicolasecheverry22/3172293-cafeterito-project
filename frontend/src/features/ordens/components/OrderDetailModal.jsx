import { createPortal } from "react-dom";
import { X } from "lucide-react";
import useDialogA11y from "@/shared/hooks/useDialogA11y";

export default function OrderDetailModal({ isOpen, onClose, order }) {
  // Escape, foco inicial, Tab atrapado y foco devuelto al cerrar
  const dialogRef = useDialogA11y(isOpen && Boolean(order), onClose);

  if (!isOpen || !order) return null;

  const total = order.total ?? 0;

  // Formatear la fecha
  const formattedDate = order.createdAt
    ? order.createdAt.split("-").reverse().join("/")
    : "-";

  // Portal a <body>: la tarjeta de la página usa backdrop-blur, y backdrop-filter
  // convierte a sus hijos position:fixed en relativos a ella (el modal salía cortado bajo el Navbar)
  return createPortal(
    // Overlay oscuro de fondo con animación y backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Contenido del modal (e.stopPropagation evita que al hacer clic dentro se cierre) */}
      {/* M3 dialog: radio 28px, padding 24px, elevación 3; scroll interno si no cabe */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="order-detail-title"
        className="bg-background text-text-primary rounded-none sm:rounded-shape-xl max-w-lg w-full h-dvh max-h-dvh sm:h-auto sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6 shadow-elevation-3 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-surface-muted pb-4 mb-4">
          <div>
            <h3 id="order-detail-title" className="text-lg font-bold text-text-primary">
              Detalles de la Orden #{order.id}
            </h3>
            <p className="text-xs text-text-secondary">
              Registrada el {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="touch-target p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <X size={20} />
          </button>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm bg-surface-muted/50 p-3 rounded-shape-md border border-surface-muted">
          <div>
            <span className="block text-xs text-text-secondary font-medium">Mesa</span>
            <span className="font-semibold text-text-primary">Mesa {order.tableNumber}</span>
          </div>
          <div>
            <span className="block text-xs text-text-secondary font-medium">Encargado</span>
            <span className="font-semibold text-text-primary">{order.waiter}</span>
          </div>
          <div>
            <span className="block text-xs text-text-secondary font-medium">Estado</span>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                order.status === "pagada"
                  ? "bg-success-container text-on-success-container"
                  : "bg-warning-container text-on-warning-container"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Listado de ítems */}
        <h4 className="font-semibold text-text-primary text-sm mb-2">
          Productos solicitados
        </h4>
        <div className="border border-surface-muted rounded-shape-md overflow-x-auto mb-4">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/50 text-text-secondary font-medium border-b border-surface-muted">
              <tr>
                <th className="py-2 px-3">Producto</th>
                <th className="py-2 px-3 text-center">Cant.</th>
                <th className="py-2 px-3 text-right">Precio</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-muted text-text-primary">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 px-3 font-medium">{item.dish}</td>
                  <td className="py-2 px-3 text-center">{item.quantity}</td>
                  <td className="py-2 px-3 text-right text-text-secondary">
                    ${item.price.toLocaleString("es-CO")}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    ${(item.price * item.quantity).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total y botón de cierre */}
        <div className="flex justify-between items-center border-t border-surface-muted pt-4 mt-2">
          <div>
            <span className="text-xs text-text-secondary block font-medium">Total a pagar</span>
            <span className="text-xl font-bold text-text-primary">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
              }).format(total)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="touch-target h-10 px-4 bg-surface-muted hover:bg-border text-text-primary rounded-md text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
