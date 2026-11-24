// src/users/pages/UserListPage.js
import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import usePermission from "@/shared/hooks/usePermission";
import { getUserColumns } from "../table/UserColumns";
import { getUsers } from "@/services/userApi";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage() {
  const { guard } = usePermission();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const loadUsers = useCallback(() => {
    getUsers()
      .then((data) =>
        setUsers(
          data.map((u) => ({
            ...u,
            userRole: u.groups?.length ? u.groups.join(", ") : "Sin rol",
          }))
        )
      )
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // 1. Reordena la lista de usuarios según el estado actual
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
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
  }, [users, sortConfig]);

  // 2. Genera las columnas pasando el estado y la función de click
  const columns = useMemo(
    () => getUserColumns(sortConfig, handleSort, loadUsers),
    [sortConfig, loadUsers]
  );

  return (
    <div className="w-full">
      <div className="bg-surface/40 dark:bg-surface/80 backdrop-blur-md rounded-shape-xl p-4 sm:p-6 md:p-8 border border-border/40 shadow-elevation-3">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary">
            Listado de Usuarios
          </h1>

          {/* Móvil: botones apilados a ancho completo; desde sm, en fila */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto *:w-full sm:*:w-auto">
            <Button
              size="md"
              variant="tertiary"
              onClick={() => setIsModalOpen(true)}
              {...guard("report_user", "generar reportes de usuarios")}
            >
              Reportar usuarios
            </Button>

            <Button as={Link} to="/userCreate" size="md" variant="primary" {...guard("create_user", "crear usuarios")}>Crear usuario</Button>
          </div>
        </div>

        {loadError && (
          <p className="text-error text-sm mb-4">
            No se pudieron cargar los usuarios desde el servidor: {loadError}
          </p>
        )}

        <div className="min-w-0">
          <DataTable data={sortedUsers} columns={columns} />
        </div>

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

