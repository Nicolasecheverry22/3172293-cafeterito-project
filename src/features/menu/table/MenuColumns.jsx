// src/menu/table/MenuColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import MenuRowActions from "../components/MenuRowActions";

export const getMenuColumns = (sortConfig, onSort) => [
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

  // Columna Platillo / Producto (Ordenable)
  {
    accessorKey: "productName",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("productName")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Platillo</span>
        {sortConfig.key === "productName" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },

  // Columna Categoría (Ordenable)
  {
    accessorKey: "category",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("category")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Categoría</span>
        {sortConfig.key === "category" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },

  // Columna Precio (Ordenable)
  {
    accessorKey: "price",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("price")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Precio</span>
        {sortConfig.key === "price" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
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

  // Columna Estado
  {
    accessorKey: "isAvailable",
    header: "Estado",
    cell: ({ row }) => {
      return row.original.isAvailable ? "Disponible" : "No disponible";
    },
  },

  // Columna Acciones
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <MenuRowActions product={row.original} />,
  },
];