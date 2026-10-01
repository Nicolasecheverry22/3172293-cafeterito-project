// src/providers/pages/ProviderListPage.js
import { useState, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { getProviderColumns } from "../table/ProviderColumns";
import { providers as initialProviders } from "../data/providers";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function ProviderListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar columna y dirección del ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: "nit", direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Reordena dinámicamente el arreglo de proveedores
  const sortedProviders = useMemo(() => {
    return [...initialProviders].sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === "nit") {
        return direction === "asc"
          ? String(a.nit).localeCompare(String(b.nit), undefined, { numeric: true })
          : String(b.nit).localeCompare(String(a.nit), undefined, { numeric: true });
      }

      if (key === "providerName") {
        return direction === "asc"
          ? a.providerName.localeCompare(b.providerName, "es", { sensitivity: "base" })
          : b.providerName.localeCompare(a.providerName, "es", { sensitivity: "base" });
      }

      return 0;
    });
  }, [sortConfig]);

  // Genera la configuración de columnas dinámicas
  const columns = useMemo(
    () => getProviderColumns(sortConfig, handleSort),
    [sortConfig]
  );

  return (
    <div className="w-full">
      <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Proveedores
          </h1>

          <div className="flex items-center gap-4">
            <Button
              size="md"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar proveedor
            </Button>

            <Link to="/providerCreate">
              <Button size="md" variant="primary">
                Crear proveedor
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto bg-surface/0 shadow-xs">
          <DataTable data={sortedProviders} columns={columns} />
        </div>

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}