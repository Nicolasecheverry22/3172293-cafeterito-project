// src/inventory/table/InventoryColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import InventoryRowActions from "../components/InventoryRowActions";

export const getInventoryColumns = (sortConfig, onSort) => [
  // Columna ID (Ordenable)
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

  // Columna Producto (Ordenable)
  {
    accessorKey: "productName",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("productName")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Producto</span>
        {sortConfig.key === "productName" ? (
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
      const price = row.original.price;

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

  // Columna Acciones
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <InventoryRowActions product={row.original} />,
  },
];