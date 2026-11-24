// src/inventory/table/InventoryColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown, Package } from "lucide-react";
import InventoryRowActions from "../components/InventoryRowActions";
import { ImageThumb } from "@/shared";

export const getInventoryColumns = (sortConfig, onSort, onChanged) => [
  {
    accessorKey: "id",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("id")}
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Id</span>
        {sortConfig.key === "id" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
  },

  {
    accessorKey: "provisionName",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("provisionName")}
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Provisión</span>
        {sortConfig.key === "provisionName" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
    // Miniatura del insumo junto al nombre
    cell: ({ row }) => (
      <span className="name-cell">
        <ImageThumb src={row.original.provisionImageThumb} alt="" icon={Package} size="sm" />
        <span>{row.original.provisionName}</span>
      </span>
    ),
  },

  // Columna Categoría
  {
    accessorKey: "category",
    header: "Categoría",
    meta: { hideBelow: "lg" },
  },

  // Columna Lote
  {
    accessorKey: "batch",
    header: "Lote",
    meta: { hideBelow: "md" },
  },

  // Columna Stock
  {
    accessorKey: "stock",
    header: "Stock",
  },

  // Columna Unidad
  {
    accessorKey: "unit",
    header: "Unidad",
    meta: { hideBelow: "md" },
  },

  // Columna Precio
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const price = row.original.price ?? 0;

      return (
        <span>
          {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }).format(price)}
        </span>
      );
    },
  },

  // Columna Estado
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      // 1. Obtener el valor crudo del estado desde cualquier clave posible
      const rawStatus =
        row.original.status ||
        row.original.provisionStatus ||
        (row.original.isActive ? "Activo" : "Agotado");

      // 2. Normalizar a minúsculas y remover tildes para la búsqueda de estilos
      const normalizedKey = String(rawStatus)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      // 3. Mapeo de clases de Tailwind según estado
      const statusStyles = {
        activo: "bg-success-container text-on-success-container border-success/30 font-semibold",
        disponible: "bg-success-container text-on-success-container border-success/30 font-semibold",
        vencido: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700 font-semibold",
        averia: "bg-warning-container text-on-warning-container border-warning/30 font-semibold",
        agotado: "bg-surface-muted text-text-primary border-border font-semibold",
      };

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${
            statusStyles[normalizedKey] || "bg-surface-muted text-text-primary border-border"
          }`}
        >
          {rawStatus}
        </span>
      );
    },
  },

  // Columna Acciones
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <InventoryRowActions provision={row.original} onChanged={onChanged} />,
  },
];