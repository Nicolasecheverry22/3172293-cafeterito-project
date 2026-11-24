// src/ordens/pages/OrdenListPage.js
import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import usePermission from "@/shared/hooks/usePermission";
import { Link } from "react-router-dom";
import { getOrdensColumns } from "../table/OrdensColumns";
import { getOrders } from "@/services/orderApi";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function OrdenListPage() {
  const { guard } = usePermission();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar la columna y dirección del ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  // Órdenes cargadas desde la base de datos (API del backend)
  const [orders, setOrders] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const loadOrders = useCallback(() => {
    getOrders()
      .then((data) => {
        setOrders(data);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Reordena dinámicamente las órdenes
  const sortedOrdens = useMemo(() => {
    return [...orders].sort((a, b) => {
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
          ? (a.waiter ?? "").localeCompare(b.waiter ?? "", "es", { sensitivity: "base" })
          : (b.waiter ?? "").localeCompare(a.waiter ?? "", "es", { sensitivity: "base" });
      }

      return 0;
    });
  }, [orders, sortConfig]);

  // Genera las columnas pasando la configuración y el handler de ordenamiento
  const columns = useMemo(
    () => getOrdensColumns(sortConfig, handleSort, loadOrders),
    [sortConfig, loadOrders]
  );

  return (
    <div className="w-full">
      <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Órdenes
          </h1>

          {/* Móvil: botones apilados a ancho completo; desde sm, en fila */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto *:w-full sm:*:w-auto">
            <Button
              size="md"
              variant="tertiary"
              onClick={() => setIsModalOpen(true)}
              {...guard("report_order", "generar reportes de órdenes")}
            >
              Reportar órdenes
            </Button>

            <Button as={Link} to="/ordensCreate" size="md" variant="primary" {...guard("create_order", "crear órdenes")}>Crear orden</Button>
          </div>
        </div>

        {loadError && (
          <p className="text-error text-small mb-4">
            No se pudieron cargar las órdenes: {loadError}
          </p>
        )}

        <div className="min-w-0 bg-surface/0 shadow-elevation-1">
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