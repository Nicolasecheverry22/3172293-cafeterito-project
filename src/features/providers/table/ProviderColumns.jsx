import ProviderRowActions from "../components/ProviderRowActions";

export const columns = [
    {
        accessorKey: "name",
        header: "Nombre",
    },
    {
        accessorKey: "email",
        header: "Correo",
    },
    {
        accessorKey: "phone",
        header: "Teléfono",
    },
    {
        accessorKey: "actions",
        header: "Acciones",
        cell: ({ row }) => (
            <ProviderRowActions provider={row.original} />
        ),
    },
];// Componente reutilizable que muestra un switch para activar o desactivar estados
import { StatusSwitch } from "@/shared";

// Definición de las columnas de la tabla de proveedores
export const ProviderColumns = [

  // Columna NIT (reemplaza ID)
  {
    accessorKey: "nit",
    header: "NIT",
  },

  // Columna Nombre
  {
    accessorKey: "providerName",
    header: "Nombre",
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

  // Columna Estado (activo / inactivo)
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

        // updateProviderStatus(provider.provider_id, value)
      };

      return (
        <StatusSwitch
          checked={provider.is_active}
          onChange={handleChange}
        />
      );
    },
  },

  // Columna de acciones (editar / eliminar)
  {
    id: "actions",
    cell: ({ row }) => (
      <ProviderRowActions provider={row.original} />
    ),
  },
];