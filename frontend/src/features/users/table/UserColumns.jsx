// src/users/table/UserColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import UserRowActions from "../components/UserRowActions";
import { ImageThumb } from "@/shared";

export const getUserColumns = (sortConfig, onSort, onChanged) => [
  {
    accessorKey: "id",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("id")}
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
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
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Nombre</span>
        {sortConfig.key === "userName" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
    // Avatar (miniatura 96×96 o iniciales) junto al nombre
    cell: ({ row }) => (
      <span className="name-cell">
        <ImageThumb
          src={row.original.userImageThumb}
          alt=""
          name={row.original.userName}
          size="sm"
          round
        />
        <span>{row.original.userName}</span>
      </span>
    ),
  },
  {
    accessorKey: "userRole",
    header: "Rol",
    meta: { hideBelow: "lg" },
  },
  {
    accessorKey: "userDocument",
    header: "Documento",
    meta: { hideBelow: "xl" },
  },
  {
    accessorKey: "userEmail",
    header: "Correo",
    meta: { hideBelow: "lg" },
  },
  {
    accessorKey: "userPhone",
    header: "Teléfono",
    meta: { hideBelow: "xl" },
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
        ? "bg-success-container text-on-success-container border-success/30 font-semibold"
        : "bg-error-container text-on-error-container border-error/30 font-semibold";

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${statusStyles}`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <UserRowActions user={row.original} onChanged={onChanged} />,
  },
];