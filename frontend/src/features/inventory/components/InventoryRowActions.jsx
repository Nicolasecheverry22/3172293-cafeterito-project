import { Pencil, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Button } from "@/shared";
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
        confirmButton:
          "!bg-brand !text-text-on-brand border-2 border-border-strong px-4 py-2 rounded-shape-md font-bold cursor-pointer mr-2",
        cancelButton:
          "!bg-error/20 !text-text-primary border-2 border-error px-4 py-2 rounded-shape-md font-bold cursor-pointer",
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
      <Button
        variant="info"
        size="xs"
        shape="pill"
        onClick={() => provision.id && navigate(`/InventoryView/${provision.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Ver detalles"
        aria-label="Ver detalles del suministro"
        {...guard("view_inventory", "ver el detalle de suministros")}
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant="edit"
        size="xs"
        shape="pill"
        onClick={() => provision.id && navigate(`/editInventory/${provision.id}`)}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Editar suministro"
        aria-label="Editar suministro"
        {...guard("update_inventory", "editar suministros")}
      >
        <Pencil className="w-5 h-5" aria-hidden="true" />
      </Button>

      <Button
        variant="detail"
        size="xs"
        shape="pill"
        onClick={handleChangeStatus}
        className="row-actions__btn !px-0 !w-12 !h-12"
        title="Cambiar estado"
        aria-label="Cambiar estado del suministro"
        {...guard("change_status_inventory", "cambiar el estado de suministros")}
      >
        <RefreshCw className="w-5 h-5" aria-hidden="true" />
      </Button>
    </div>
  );
}