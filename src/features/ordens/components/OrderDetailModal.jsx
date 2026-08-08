import { Button } from "@/shared";

export default function OrderDetailModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Detalle de Orden</h2>

        <p><strong>Mesa:</strong> {order.tableNumber}</p>
        <p><strong>Encargado:</strong> {order.waiter}</p>
        <p><strong>Estado:</strong> {order.status}</p>

        <h3 className="mt-4 mb-2 font-semibold">Platillos</h3>

        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Cantidad</th>
              <th className="border p-2">Precio</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                {/* ✅ CORREGIDO: usar dish */}
                <td className="border p-2">{item.dish}</td>

                <td className="border p-2">{item.quantity}</td>

                <td className="border p-2">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ BOTÓN usando tu sistema de diseño */}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}