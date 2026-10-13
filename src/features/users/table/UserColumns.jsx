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
    cell: ({ row }) => {
      // 1. Verificamos tanto is_active como isActive de forma flexible
      const activeValue = 
        row.original.is_active ?? 
        row.original.isActive ?? 
        true;

      const isActive = Boolean(activeValue);

      const statusStyles = isActive
        ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold"
        : "bg-rose-100 text-rose-800 border-rose-300 font-semibold";

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
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];