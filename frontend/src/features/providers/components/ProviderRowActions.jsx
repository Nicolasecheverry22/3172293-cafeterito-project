import { Pencil, Eye, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { confirmAction } from "@/shared/services/confirmAction";
import { setProviderStatus } from "@/services/providerApi";

// Acciones por fila. No existe "Eliminar": el proveedor se habilita/inhabilita (RFADMIN17).
export default function ProviderRowActions({ provider, onChanged }) {
  const navigate = useNavigate();
  const isActive = provider.is_active ?? provider.isActive ?? true;
  const name = provider.providerName || provider.nombre || "este proveedor";

  const handleToggleStatus = () =>
    confirmAction({
      title: isActive ? "¿Inhabilitar proveedor?" : "¿Habilitar proveedor?",
      text: isActive
        ? `"${name}" no podrá asignarse a insumos nuevos mientras esté inhabilitado.`
        : `"${name}" podrá volver a asignarse a insumos.`,
      confirmText: isActive ? "Sí, inhabilitar" : "Sí, habilitar",
      action: () => setProviderStatus(provider.id, !isActive),
      successTitle: isActive ? "Proveedor inhabilitado" : "Proveedor habilitado",
      successText: "El estado del proveedor se actualizó correctamente.",
      onDone: onChanged,
    });

  return (
    <div className="row-actions">
      <button
        onClick={() => navigate(`/ProviderView/${provider.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Visualizar proveedor"
      >
        <Eye size={20} />
      </button>

      <button
        onClick={() => navigate(`/EditProvider/${provider.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Editar proveedor"
      >
        <Pencil size={20} />
      </button>

      <button
        onClick={handleToggleStatus}
        className={`row-actions__btn touch-target hover:bg-surface-muted cursor-pointer ${
          isActive
            ? "text-success"
            : "text-error"
        }`}
        title={isActive ? "Activo — clic para inhabilitar" : "Inactivo — clic para habilitar"}
      >
        {isActive ? <Power size={20} /> : <PowerOff size={20} />}
      </button>
    </div>
  );
}
