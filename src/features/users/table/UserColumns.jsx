// src/users/table/UserColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import UserRowActions from "../components/UserRowActions";

export const getUserColumns = (sortConfig, onSort) => [
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
          <ArrowUpDown size={16} className="text-gray-400" />
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
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },
  {
    accessorKey: "userRole",
    header: "Rol",
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
    cell: ({ row }) => (row.original.is_active ? "Activo" : "Inactivo"),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];