// src/providers/table/ProviderColumns.js
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { StatusSwitch } from "@/shared";
import ProviderRowActions from "../components/ProviderRowActions";

export const getProviderColumns = (sortConfig, onSort) => [
  // Columna NIT (Ordenable)
  {
    accessorKey: "nit",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("nit")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>NIT</span>
        {sortConfig.key === "nit" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },

  // Columna Nombre (Ordenable)
  {
    accessorKey: "providerName",
    header: () => (
      <button
        type="button"
        onClick={() => onSort("providerName")}
        className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
      >
        <span>Nombre</span>
        {sortConfig.key === "providerName" ? (
          sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} className="text-gray-400" />
        )}
      </button>
    ),
  },

  // Columna Email
  {
    accessorKey: "providerEmail",
    header: "Email",
  },

  // Columna Teléfono
  {
    accessorKey: "providerPhone",
    header: "Teléfono",
  },

  // Columna Estado
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const provider = row.original;

      const handleChange = (value) => {
        console.log(
          "Actualizar estado proveedor:",
          provider.provider_id,
          value
        );
      };

      return (
        <StatusSwitch
          checked={provider.is_active}
          onChange={handleChange}
        />
      );
    },
  },

  // Columna Acciones
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ProviderRowActions provider={row.original} />
    ),
  },
];