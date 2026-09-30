// src/inventory/pages/InventoryListPage.js
import { useState, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { Link } from "react-router-dom";

import { getInventoryColumns } from "../table/InventoryColumns";
import { inventory as initialInventory } from "../data/inventory";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function InventoryListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para la columna y dirección del ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Reordena dinámicamente el arreglo de inventario
  const sortedInventory = useMemo(() => {
    return [...initialInventory].sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === "id") {
        return direction === "asc" ? a.id - b.id : b.id - a.id;
      }

      if (key === "productName") {
        return direction === "asc"
          ? a.productName.localeCompare(b.productName, "es", { sensitivity: "base" })
          : b.productName.localeCompare(a.productName, "es", { sensitivity: "base" });
      }

      return 0;
    });
  }, [sortConfig]);

  // Genera las columnas dinámicas según la configuración actual
  const columns = useMemo(
    () => getInventoryColumns(sortConfig, handleSort),
    [sortConfig]
  );

  return (
    <div className="w-full">
      <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Inventario
          </h1>

          <div className="flex items-center gap-4">
            <Button
              size="md"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar inventario
            </Button>

            <Link to="/inventoryCreate">
              <Button size="md" variant="primary">
                Crear producto
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto bg-surface/0 shadow-xs">
          <DataTable data={sortedInventory} columns={columns} />
        </div>

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}