import { Eye, Pencil, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { confirmAction } from "@/shared/services/confirmAction";
import { setProductStatus } from "@/services/productApi";
import usePermission from "@/shared/hooks/usePermission";

// Acciones por fila. No existe "Eliminar": el platillo se habilita/inhabilita (RFADMIN24).
export default function MenuRowActions({ product, onChanged }) {
  const { guard } = usePermission();
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
    <div className="row-actions">
      <button
        onClick={() => navigate(`/ProductView/${product.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Visualizar platillo"
        {...guard("view_product", "ver el detalle de platillos")}
      >
        <Eye size={20} />
      </button>

      <button
        onClick={() => navigate(`/EditProduct/${product.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Editar platillo"
        {...guard("update_product", "editar platillos")}
      >
        <Pencil size={20} />
      </button>

      <button
        onClick={handleToggleStatus}
        className={`row-actions__btn touch-target hover:bg-surface-muted cursor-pointer ${
          isAvailable
            ? "text-success"
            : "text-error"
        }`}
        title={isAvailable ? "Disponible — clic para inhabilitar" : "Inhabilitado — clic para habilitar"}
        {...guard("disable_product", "cambiar el estado de platillos")}
      >
        {isAvailable ? <Power size={20} /> : <PowerOff size={20} />}
      </button>
    </div>
  );
}
