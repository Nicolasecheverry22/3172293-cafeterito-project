// src/providers/pages/ProviderListPage.js
import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import { getProviderColumns } from "../table/ProviderColumns";
import { getProviders } from "@/services/providerApi";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function ProviderListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loadError, setLoadError] = useState(null);

  // Estado para controlar columna y dirección del ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: "nit", direction: "asc" });

  // Carga los proveedores desde la base de datos
  const loadProviders = useCallback(() => {
    getProviders()
      .then(setProviders)
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Reordena dinámicamente el arreglo de proveedores
  const sortedProviders = useMemo(() => {
    return [...providers].sort((a, b) => {
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
  }, [providers, sortConfig]);

  // Genera la configuración de columnas dinámicas
  const columns = useMemo(
    () => getProviderColumns(sortConfig, handleSort, loadProviders),
    [sortConfig, loadProviders]
  );

  return (
    <div className="w-full">
      <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Proveedores
          </h1>

          {/* Móvil: botones apilados a ancho completo; desde sm, en fila */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto *:w-full sm:*:w-auto">
            <Button
              size="md"
              variant="tertiary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar proveedores
            </Button>

            <Button as={Link} to="/providerCreate" size="md" variant="primary">Crear proveedor</Button>
          </div>
        </div>

        {loadError && (
          <p className="text-error text-sm mb-4">
            No se pudieron cargar los proveedores: {loadError}
          </p>
        )}

        <div className="min-w-0 bg-surface/0 shadow-elevation-1">
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