import { Pencil, Eye, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared";
import { confirmAction } from "@/shared/services/confirmAction";
import { setProviderStatus } from "@/services/providerApi";
import usePermission from "@/shared/hooks/usePermission";

// Acciones por fila. No existe "Eliminar": el proveedor se habilita/inhabilita (RFADMIN17).
export default function ProviderRowActions({ provider, onChanged }) {
  const { guard } = usePermission();
  const navigate = useNavigate();
  const isActive = provider.is_active ?? provider.isActive ?? true;
  const name = provider.providerName || provider.nombre || "este proveedor";

  const handleToggleStatus = () =>
    confirmAction({
      title: isActive ? `¿Inhabilitar al proveedor ${name}?` : `¿Habilitar al proveedor ${name}?`,
      text: isActive
        ? `"${name}" no podrá asignarse a insumos nuevos mientras esté inhabilitado.`
        : `"${name}" podrá volver a asignarse a insumos.`,
      confirmText: isActive ? "Sí, inhabilitar" : "Sí, habilitar",
      variant: isActive ? "danger" : "info",
      action: () => setProviderStatus(provider.id, !isActive),
      successTitle: isActive ? "Proveedor inhabilitado" : "Proveedor habilitado",
      successText: "El estado del proveedor se actualizó correctamente.",
      onDone: onChanged,
    });

  return (
    <div className="row-actions">
      <Button
        variant="info"
        size="xs"
        shape="pill"
        onClick={() => navigate(`/ProviderView/${provider.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Visualizar proveedor"
        aria-label={`Visualizar proveedor ${name}`}
        {...guard("view_provider", "ver el detalle de proveedores")}
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant="edit"
        size="xs"
        shape="pill"
        onClick={() => navigate(`/EditProvider/${provider.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Editar proveedor"
        aria-label={`Editar proveedor ${name}`}
        {...guard("update_provider", "editar proveedores")}
      >
        <Pencil className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant={isActive ? "enable" : "disable"}
        size="xs"
        shape="pill"
        onClick={handleToggleStatus}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title={isActive ? "Activo — clic para inhabilitar" : "Inactivo — clic para habilitar"}
        aria-label={isActive ? `Inhabilitar proveedor ${name}` : `Habilitar proveedor ${name}`}
        {...guard("disable_provider", "cambiar el estado de proveedores")}
      >
        {isActive ? <Power className="w-5 h-5" aria-hidden="true" /> : <PowerOff className="w-5 h-5" aria-hidden="true" />}
      </Button>
    </div>
  );
}