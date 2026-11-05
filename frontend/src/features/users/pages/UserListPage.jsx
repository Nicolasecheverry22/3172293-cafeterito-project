// src/users/pages/UserListPage.js
import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import { getUserColumns } from "../table/UserColumns";
import { getUsers } from "@/services/userApi";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar qué columna se ordena y en qué dirección
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  // Usuarios cargados desde la base de datos (API del backend)
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const loadUsers = useCallback(() => {
    getUsers()
      .then((data) =>
        setUsers(
          data.map((u) => ({
            ...u,
            // La BD no guarda un "rol" de texto: lo derivamos de los flags
            userRole: u.is_superuser
              ? "Administrador"
              : u.is_staff
              ? "Staff"
              : "Usuario",
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
      <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-border/40 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold font-heading text-text-primary/">
            Listado de Usuarios
          </h1>

          <div className="flex items-center gap-4">
            <Button
              size="md"
              variant="tertiary"
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

        {loadError && (
          <p className="text-red-500 text-sm mb-4">
            No se pudieron cargar los usuarios desde el servidor: {loadError}
          </p>
        )}

        <div className="overflow-x-auto bg-surface/0 shadow-xs">
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

