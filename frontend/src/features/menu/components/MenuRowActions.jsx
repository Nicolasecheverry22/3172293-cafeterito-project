import { Eye, Pencil, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { confirmAction } from "@/shared/services/confirmAction";
import { setProductStatus } from "@/services/productApi";

// Acciones por fila. No existe "Eliminar": el platillo se habilita/inhabilita (RFADMIN24).
export default function MenuRowActions({ product, onChanged }) {
  const navigate = useNavigate();
  const isAvailable = product.isAvailable ?? true;
  const name = product.productName || "este platillo";

  const handleToggleStatus = () =>
    confirmAction({
      title: isAvailable ? "¿Inhabilitar platillo?" : "¿Habilitar platillo?",
      text: isAvailable
        ? `"${name}" dejará de estar disponible para nuevas órdenes.`
        : `"${name}" volverá a estar disponible para nuevas órdenes.`,
      confirmText: isAvailable ? "Sí, inhabilitar" : "Sí, habilitar",
      action: () => setProductStatus(product.id, !isAvailable),
      successTitle: isAvailable ? "Platillo inhabilitado" : "Platillo habilitado",
      successText: "El estado del platillo se actualizó correctamente.",
      onDone: onChanged,
    });

  return (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/ProductView/${product.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Visualizar platillo"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={() => navigate(`/EditProduct/${product.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Editar platillo"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleToggleStatus}
        className={`p-1 rounded hover:bg-surface-muted cursor-pointer ${
          isAvailable
            ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        }`}
        title={isAvailable ? "Inhabilitar platillo" : "Habilitar platillo"}
      >
        {isAvailable ? <PowerOff size={16} /> : <Power size={16} />}
      </button>
    </div>
  );
}
