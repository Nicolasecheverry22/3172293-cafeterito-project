import React from "react";
import { X } from "lucide-react";

export default function OrderDetailModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const total =
    order.items?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) || 0;

  // Formatear la fecha
  const formattedDate = order.createdAt
    ? order.createdAt.split("-").reverse().join("/")
    : "-";

  return (
    // Overlay oscuro de fondo con animación y backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      {/* Contenido del modal (e.stopPropagation evita que al hacer clic dentro se cierre) */}
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Detalles de la Orden #{order.id}
            </h3>
            <p className="text-xs text-gray-500">
              Registrada el {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <span className="block text-xs text-gray-400 font-medium">Mesa</span>
            <span className="font-semibold text-gray-700">Mesa {order.tableNumber}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-medium">Encargado</span>
            <span className="font-semibold text-gray-700">{order.waiter}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-400 font-medium">Estado</span>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                order.status === "pagada"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Listado de ítems */}
        <h4 className="font-semibold text-gray-700 text-sm mb-2">
          Productos solicitados
        </h4>
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2 px-3">Producto</th>
                <th className="py-2 px-3 text-center">Cant.</th>
                <th className="py-2 px-3 text-right">Precio</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td className="py-2.5 px-3 font-medium">{item.dish}</td>
                  <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-gray-500">
                    ${item.price.toLocaleString("es-CO")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">
                    ${(item.price * item.quantity).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total y botón de cierre */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Total a pagar</span>
            <span className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
              }).format(total)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}