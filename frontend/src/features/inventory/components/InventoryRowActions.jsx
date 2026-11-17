import { Pencil, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { showSuccessAlert, showSystemErrorAlert } from "@/shared/services/alertService";
import { setInventoryStatus, INVENTORY_STATUSES } from "@/services/inventoryApi";

// Acciones por fila. No existe "Eliminar": se cambia el estado del insumo
// (Disponible / Vencido / Avería / Agotado) (RFADMIN10).
export default function InventoryRowActions({ provision, onChanged }) {
  const navigate = useNavigate();

  const handleChangeStatus = async () => {
    if (!provision.id) return;

    const { value: status, isConfirmed } = await Swal.fire({
      title: "Cambiar estado del suministro",
      text: provision.provisionName || "",
      input: "select",
      inputOptions: Object.fromEntries(INVENTORY_STATUSES.map((s) => [s, s])),
      inputValue: provision.status,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "!bg-brand text-white px-4 py-2 rounded-lg font-medium cursor-pointer mr-2",
        cancelButton: "bg-surface-muted px-4 py-2 rounded-lg font-medium cursor-pointer",
      },
      buttonsStyling: false,
    });

    if (!isConfirmed || status === provision.status) return;

    try {
      await setInventoryStatus(provision.id, status);
      await showSuccessAlert({
        title: "Estado actualizado",
        text: `El suministro quedó en estado "${status}".`,
      });
      onChanged?.();
    } catch (error) {
      await showSystemErrorAlert({ text: error.message || "No se pudo cambiar el estado." });
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => provision.id && navigate(`/InventoryView/${provision.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Ver detalles"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={() => provision.id && navigate(`/editInventory/${provision.id}`)}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Editar suministro"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleChangeStatus}
        className="p-1 rounded hover:bg-surface-muted cursor-pointer"
        title="Cambiar estado"
      >
        <RefreshCw size={16} />
      </button>
    </div>
  );
}
