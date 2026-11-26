import { Eye, Pencil, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared";
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
      title: isAvailable ? `¿Inhabilitar el platillo ${name}?` : `¿Habilitar el platillo ${name}?`,
      text: isAvailable
        ? `"${name}" dejará de estar disponible para nuevas órdenes.`
        : `"${name}" volverá a estar disponible para nuevas órdenes.`,
      confirmText: isAvailable ? "Sí, inhabilitar" : "Sí, habilitar",
      variant: isAvailable ? "danger" : "info",
      action: () => setProductStatus(product.id, !isAvailable),
      successTitle: isAvailable ? "Platillo inhabilitado" : "Platillo habilitado",
      successText: "El estado del platillo se actualizó correctamente.",
      onDone: onChanged,
    });

  return (
    <div className="row-actions">
      <Button
        variant="info"
        size="xs"
        shape="pill"
        onClick={() => navigate(`/ProductView/${product.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Visualizar platillo"
        aria-label={`Visualizar platillo ${name}`}
        {...guard("view_product", "ver el detalle de platillos")}
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant="edit"
        size="xs"
        shape="pill"
        onClick={() => navigate(`/EditProduct/${product.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Editar platillo"
        aria-label={`Editar platillo ${name}`}
        {...guard("update_product", "editar platillos")}
      >
        <Pencil className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant={isAvailable ? "enable" : "disable"}
        size="xs"
        shape="pill"
        onClick={handleToggleStatus}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title={isAvailable ? "Disponible — clic para inhabilitar" : "Inhabilitado — clic para habilitar"}
        aria-label={isAvailable ? `Inhabilitar platillo ${name}` : `Habilitar platillo ${name}`}
        {...guard("disable_product", "cambiar el estado de platillos")}
      >
        {isAvailable ? <Power className="w-5 h-5" aria-hidden="true" /> : <PowerOff className="w-5 h-5" aria-hidden="true" />}
      </Button>
    </div>
  );
}