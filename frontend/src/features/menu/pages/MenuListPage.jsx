// src/menu/pages/MenuListPage.js
import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import usePermission from "@/shared/hooks/usePermission";
import { Link } from "react-router-dom";

import { getMenuColumns } from "../table/MenuColumns";
import { getProducts } from "@/services/productApi";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function MenuListPage() {
  const { guard } = usePermission();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menu, setMenu] = useState([]);
  const [loadError, setLoadError] = useState(null);

  // Estado para la columna y dirección del ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  // Carga los platillos desde la base de datos
  const loadMenu = useCallback(() => {
    getProducts()
      .then(setMenu)
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Reordena dinámicamente la lista de platillos
  const sortedMenu = useMemo(() => {
    return [...menu].sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === "id") {
        return direction === "asc" ? a.id - b.id : b.id - a.id;
      }

      if (key === "price") {
        return direction === "asc" ? a.price - b.price : b.price - a.price;
      }

      if (key === "productName") {
        return direction === "asc"
          ? a.productName.localeCompare(b.productName, "es", { sensitivity: "base" })
          : b.productName.localeCompare(a.productName, "es", { sensitivity: "base" });
      }

      if (key === "category") {
        return direction === "asc"
          ? a.category.localeCompare(b.category, "es", { sensitivity: "base" })
          : b.category.localeCompare(a.category, "es", { sensitivity: "base" });
      }

      return 0;
    });
  }, [menu, sortConfig]);

  // Genera las columnas dinámicas según la configuración actual
  const columns = useMemo(
    () => getMenuColumns(sortConfig, handleSort, loadMenu),
    [sortConfig, loadMenu]
  );

  return (
    <div className="w-full">
      <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Menú
          </h1>

          {/* Móvil: botones apilados a ancho completo; desde sm, centrados en fila */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto *:w-full sm:*:w-auto">
            <Button
              size="md"
              variant="warm"
              onClick={() => setIsModalOpen(true)}
              {...guard("report_product", "generar reportes del menú")}
            >
              Reportar menú
            </Button>

            <Button
              as={Link}
              to="/menuCreate"
              size="lg"
              variant="primary"
              {...guard("create_product", "crear platillos")}
            >
              Crear platillo
            </Button>
          </div>
        </div>

        {loadError && (
          <p className="text-error text-sm mb-4">
            No se pudieron cargar los platillos: {loadError}
          </p>
        )}

        <div className="min-w-0 bg-surface/0 shadow-elevation-1">
          <DataTable data={sortedMenu} columns={columns} />
        </div>

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

