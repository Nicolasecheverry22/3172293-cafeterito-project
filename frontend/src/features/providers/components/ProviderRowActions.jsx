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
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/ProviderView/${provider.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Visualizar proveedor"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={() => navigate(`/EditProvider/${provider.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Editar proveedor"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleToggleStatus}
        className={`p-1 rounded hover:bg-surface-muted cursor-pointer ${
          isActive
            ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        }`}
        title={isActive ? "Inhabilitar proveedor" : "Habilitar proveedor"}
      >
        {isActive ? <PowerOff size={16} /> : <Power size={16} />}
      </button>
    </div>
  );
}
