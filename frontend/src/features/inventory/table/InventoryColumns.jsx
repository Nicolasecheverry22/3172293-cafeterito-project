// src/inventory/table/InventoryColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import InventoryRowActions from "../components/InventoryRowActions";

export const getInventoryColumns = (sortConfig, onSort) => [
  {
    accessorKey: "id",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("id")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Id</span>
        {sortConfig.key === "id" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
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
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Provisión</span>
        {sortConfig.key === "provisionName" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },

  // Columna Categoría
  {
    accessorKey: "category",
    header: "Categoría",
  },

  // Columna Lote
  {
    accessorKey: "batch",
    header: "Lote",
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
        activo: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
        disponible: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
        vencido: "bg-rose-100 text-rose-800 border-rose-300 font-semibold",
        averia: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
        agotado: "bg-gray-100 text-gray-800 border-gray-300 font-semibold",
      };

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border capitalize ${
            statusStyles[normalizedKey] || "bg-gray-100 text-gray-800 border-gray-200"
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
    cell: ({ row }) => <InventoryRowActions provision={row.original} />,
  },
];