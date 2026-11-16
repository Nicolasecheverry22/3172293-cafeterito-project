// src/users/table/UserColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import UserRowActions from "../components/UserRowActions";

export const getUserColumns = (sortConfig, onSort, onDeleted) => [
  {
    accessorKey: "id",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("id")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>ID</span>
        {sortConfig.key === "id" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
  },
  {
    accessorKey: "userName",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("userName")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Nombre</span>
        {sortConfig.key === "userName" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
  },
  {
    accessorKey: "userRole",
    header: "Rol",
  },
  {
    accessorKey: "userDocument",
    header: "Documento",
  },
  {
    accessorKey: "userEmail",
    header: "Correo",
  },
  {
    accessorKey: "userPhone",
    header: "Teléfono",
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    meta: {
      searchValue: (row) => ((row.is_active ?? row.isActive ?? true) ? "Activo" : "Inactivo"),
    },
    cell: ({ row }) => {
      // 1. Verificamos tanto is_active como isActive de forma flexible
      const activeValue = 
        row.original.is_active ?? 
        row.original.isActive ?? 
        true;

      const isActive = Boolean(activeValue);

      const statusStyles = isActive
        ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700 font-semibold"
        : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700 font-semibold";

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border capitalize ${statusStyles}`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <UserRowActions user={row.original} onDeleted={onDeleted} />,
  },
];