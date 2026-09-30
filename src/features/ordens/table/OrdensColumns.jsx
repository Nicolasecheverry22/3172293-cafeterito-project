// src/ordens/table/OrdensColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import OrdensRowActions from "../components/OrdensRowActions";

export const getOrdensColumns = (sortConfig, onSort) => [
  // Columna Orden (ID)
  {
    accessorKey: "id",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("id")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Orden</span>
        {sortConfig.key === "id" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },

  // Columna Mesa
  {
    accessorKey: "tableNumber",
    header: "Mesa",
  },

  // Nueva Columna: Fecha
  {
    accessorKey: "createdAt",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("createdAt")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Fecha</span>
        {sortConfig.key === "createdAt" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const rawDate = row.original.createdAt;
      if (!rawDate) return "-";
      
      // Formatear a DD/MM/AAAA
      const [year, month, day] = rawDate.split("-");
      return `${day}/${month}/${year}`;
    },
  },

  // Columna Encargado (Nombre)
  {
    accessorKey: "waiter",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("waiter")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Encargado</span>
        {sortConfig.key === "waiter" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },

  // Columna Total
  {
    id: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.original.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(total);
    },
  },

  // Columna Estado
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;

      if (status === "activa") return "Activa";
      if (status === "pagada") return "Pagada";
      return status;
    },
  },

  // Columna Acciones
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <OrdensRowActions order={row.original} />,
  },
];