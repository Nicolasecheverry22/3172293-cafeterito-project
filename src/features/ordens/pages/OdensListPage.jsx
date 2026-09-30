// src/ordens/pages/OrdenListPage.js
import { useState, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { Link } from "react-router-dom";
import { getOrdensColumns } from "../table/OrdensColumns";
import { ordens as initialOrdens } from "../data/ordens";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function OrdenListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar la columna y dirección del ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Reordena dinámicamente las órdenes
  const sortedOrdens = useMemo(() => {
    return [...initialOrdens].sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === "id") {
        return direction === "asc" ? a.id - b.id : b.id - a.id;
      }

      if (key === "createdAt") {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (key === "waiter") {
        return direction === "asc"
          ? a.waiter.localeCompare(b.waiter, "es", { sensitivity: "base" })
          : b.waiter.localeCompare(a.waiter, "es", { sensitivity: "base" });
      }

      return 0;
    });
  }, [sortConfig]);

  // Genera las columnas pasando la configuración y el handler de ordenamiento
  const columns = useMemo(
    () => getOrdensColumns(sortConfig, handleSort),
    [sortConfig]
  );

  return (
    <div className="w-full">
      <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Órdenes
          </h1>

          <div className="flex items-center gap-4">
            <Button
              size="md"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar órdenes
            </Button>

            <Link to="/ordensCreate">
              <Button size="md" variant="primary">
                Crear orden
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto bg-surface/0 shadow-xs">
          <DataTable data={sortedOrdens} columns={columns} />
        </div>

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}