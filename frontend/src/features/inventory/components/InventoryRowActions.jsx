import { Pencil, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { showSuccessAlert, showSystemErrorAlert } from "@/shared/services/alertService";
import { setInventoryStatus, INVENTORY_STATUSES } from "@/services/inventoryApi";
import usePermission from "@/shared/hooks/usePermission";

// Acciones por fila. No existe "Eliminar": se cambia el estado del insumo
// (Disponible / Vencido / Avería / Agotado) (RFADMIN10).
export default function InventoryRowActions({ provision, onChanged }) {
  const { guard } = usePermission();
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
        popup: "rounded-shape-lg",
        confirmButton: "!bg-brand !text-text-on-brand px-4 py-2 rounded-shape-sm font-medium cursor-pointer mr-2",
        cancelButton: "bg-surface-muted px-4 py-2 rounded-shape-sm font-medium cursor-pointer",
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
    <div className="row-actions">
      <button
        onClick={() => provision.id && navigate(`/InventoryView/${provision.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Ver detalles"
        {...guard("view_inventory", "ver el detalle de suministros")}
      >
        <Eye size={20} />
      </button>

      <button
        onClick={() => provision.id && navigate(`/editInventory/${provision.id}`)}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Editar suministro"
        {...guard("update_inventory", "editar suministros")}
      >
        <Pencil size={20} />
      </button>

      <button
        onClick={handleChangeStatus}
        className="row-actions__btn touch-target hover:bg-surface-muted cursor-pointer"
        title="Cambiar estado"
        {...guard("change_status_inventory", "cambiar el estado de suministros")}
      >
        <RefreshCw size={20} />
      </button>
    </div>
  );
}
