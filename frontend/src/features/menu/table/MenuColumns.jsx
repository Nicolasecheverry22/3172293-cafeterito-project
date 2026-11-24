// src/menu/table/MenuColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown, UtensilsCrossed } from "lucide-react";
import MenuRowActions from "../components/MenuRowActions";
import { ImageThumb } from "@/shared";

export const getMenuColumns = (sortConfig, onSort, onChanged) => [
  // Columna ID (Ordenable)
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

  // Columna Imagen (RFADMIN22): miniatura de tamaño uniforme; placeholder si no hay (RFADMIN21)
  {
    id: "image",
    header: "Imagen",
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <ImageThumb
        src={row.original.productImageThumb}
        alt={`Imagen de ${row.original.productName}`}
        icon={UtensilsCrossed}
        size="md"
      />
    ),
  },

  // Columna Platillo / Producto (Ordenable)
  {
    accessorKey: "productName",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("productName")}
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Platillo</span>
        {sortConfig.key === "productName" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
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
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Categoría</span>
        {sortConfig.key === "category" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
        )}
      </button>
    ),
    meta: { hideBelow: "md" },
  },

  // Columna Precio (Ordenable)
  {
    accessorKey: "price",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("price")}
        className="flex items-center gap-2 min-h-touch min-w-touch font-semibold hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span>Precio</span>
        {sortConfig.key === "price" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="opacity-50" />
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
    meta: {
      searchValue: (row) => (row.isAvailable ? "Disponible" : "No disponible"),
    },
    cell: ({ row }) => {
      const isAvailable = row.original.isAvailable;

      const statusStyles = isAvailable
        ? "bg-success-container text-on-success-container border-success/30"
        : "bg-error-container text-on-error-container border-error/30";

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles}`}
        >
          {isAvailable ? "Disponible" : "No disponible"}
        </span>
      );
    },
  },

  // Columna Acciones
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <MenuRowActions product={row.original} onChanged={onChanged} />,
  },
];

