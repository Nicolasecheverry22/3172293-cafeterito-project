// src/ordens/table/OrdensColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import OrdensRowActions from "../components/OrdensRowActions";

export const getOrdensColumns = (sortConfig, onSort, onChanged) => [
  // Columna Orden (ID)
  {
    accessorKey: "id",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("id")}
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Orden</span>
        {sortConfig.key === "id" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
  },

  // Columna Mesa
  {
    accessorKey: "tableNumber",
    header: "Mesa",
  },

  // Columna Fecha
  {
    accessorKey: "createdAt",
    meta: { hideBelow: "lg" },
    header: () => (
      <button
        type="button"
        onClick={() => onSort("createdAt")}
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Fecha</span>
        {sortConfig.key === "createdAt" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
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
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Encargado</span>
        {sortConfig.key === "waiter" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
    meta: { hideBelow: "lg" },
  },

  // Columna Total
  {
    id: "total",
    header: "Total",
    cell: ({ row }) => {
      // El total viene calculado desde la BD
      const total = row.original.total ?? 0;

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
      const status = row.original.status?.toLowerCase();

      // Mapeo de colores y estilos según el estado de la orden
      const statusStyles = {
        activa: "bg-warning-container text-on-warning-container border-warning/30",
        pagada: "bg-success-container text-on-success-container border-success/30",
        cancelada: "bg-error-container text-on-error-container border-error/30",
        "lista para entrega": "bg-info-container text-on-info-container border-info/30",
      };

      const statusLabels = {
        activa: "Activa",
        pagada: "Pagada",
        cancelada: "Cancelada",
        "lista para entrega": "Lista para entrega",
      };

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
            statusStyles[status] || "bg-surface-muted text-text-primary border-border"
          }`}
        >
          {statusLabels[status] || status}
        </span>
      );
    },
  },

  // Columna Acciones
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <OrdensRowActions order={row.original} onChanged={onChanged} />,
  },
];