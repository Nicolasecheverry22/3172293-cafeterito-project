import { useParams, useNavigate } from "react-router-dom";
import { Input, Button } from "@/shared";
import { ClipboardList, SquarePen } from "lucide-react";
import { ordens } from "../ordens/data/ordens";

export default function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = ordens.find((o) => String(o.id) === String(id));

  if (!order) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="flex items-center gap-3 mt-10 ml-12">
          <ClipboardList className="w-10 h-10 text-text-primary" />
          <h1 className="text-main font-heading font-bold text-text-primary">
            Visualizar Orden
          </h1>
        </div>
        <p className="ml-12 mt-8 text-red-500">La orden solicitada no existe.</p>
      </div>
    );
  }

  // Estilos de estado idénticos a los de la tabla
  const getStatusBadge = (status) => {
    const st = status?.toLowerCase() || "";
    const styles =
      st === "pagada"
        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
        : "bg-amber-100 text-amber-800 border-amber-200"; 

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${styles}`}>
        {order.status}
      </span>
    );
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  // Cálculo automático del total basado en los items (dish, quantity, price)
  const calculatedTotal = order.items
    ? order.items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
    : 0;

  return (
    <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
      {/* Encabezado Principal */}
      <div className="max-w-7xl w-full mx-auto px-4 mt-4 mb-6 flex items-center gap-3">
        <ClipboardList className="w-9 h-9 text-text-primary" />
        <h1 className="text-main font-heading font-bold text-text-primary text-2xl">
          Visualizar Orden #{order.id}
        </h1>
      </div>

      {/* Grid Responsivo Estandarizado */}
      <div className="max-w-7xl w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Columna 1: Estado General y Acciones */}
        <div className="bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-6 text-center">
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-text-primary font-heading font-bold text-md">
              Estado
            </p>
            {getStatusBadge(order.status)}
          </div>

          <div className="w-full flex flex-col gap-3">
            <p className="text-text-primary font-heading font-bold text-md">
              Acciones
            </p>
            <Button
              variant="tertiary"
              type="button"
              size="md"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate(`/EditOrder/${order.id}`)}
            >
              <SquarePen className="w-5 h-5" />
              Editar Orden
            </Button>
          </div>
        </div>

        {/* Columna 2, 3 y 4: Información Detallada */}
        <div className="lg:col-span-3 bg-surface-muted rounded-3xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-6">
          
          {/* Datos Generales */}
          <div className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Cliente"
              value={order.clientName || "Cliente Ocasional"}
              disabled
            />
            <Input
              label="Número de Mesa"
              value={`Mesa ${order.tableNumber ?? "-"}`}
              disabled
            />
            <Input
              label="Mesero Asignado"
              value={order.waiter || "Sin asignar"}
              disabled
            />
          </div>

          {/* Tabla de Platillos Seleccionados */}
          <div className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-border/40 space-y-4">
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
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index} className="border-b border-border/20">
                        <td className="py-3 px-3 font-medium text-text-primary">
                          {item.dish}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {formatCurrency(item.price)}
                        </td>
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
                Total: <span className="text-primary">{formatCurrency(calculatedTotal)}</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}