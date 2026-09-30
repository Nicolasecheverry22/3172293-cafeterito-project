// src/users/pages/UserListPage.js
import { useState, useMemo } from "react";
import { DataTable, Button } from "@/shared";
import { getUserColumns } from "../table/UserColumns";
import { users as initialUsers } from "../data/users";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar qué columna se ordena y en qué dirección
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // 1. Reordena la lista de usuarios según el estado actual
  const sortedUsers = useMemo(() => {
    return [...initialUsers].sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === "id") {
        return direction === "asc" ? a.id - b.id : b.id - a.id;
      }

      if (key === "userName") {
        return direction === "asc"
          ? a.userName.localeCompare(b.userName, "es", { sensitivity: "base" })
          : b.userName.localeCompare(a.userName, "es", { sensitivity: "base" });
      }

      return 0;
    });
  }, [sortConfig]);

  // 2. Genera las columnas pasando el estado y la función de click
  const columns = useMemo(
    () => getUserColumns(sortConfig, handleSort),
    [sortConfig]
  );

  return (
    <div className="w-full">
      {/* Tarjeta contenedora principal con opacidad y desenfoque para eliminar el ruido visual */}
      <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
        
        {/* Encabezado con título y botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Usuarios
          </h1>

          <div className="flex items-center gap-4">
            <Button
              size="md"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Reportar usuario
            </Button>

            <Link to="/userCreate">
              <Button size="md" variant="primary">
                Crear usuario
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabla dentro de un contenedor opaco redondeado */}
        <div className="overflow-x-auto bg-surface/0 shadow-xs">
          <DataTable data={sortedUsers} columns={columns} />
        </div>

        {/* Modal de reportes */}
        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

