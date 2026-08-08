import OrdensRowActions from "../components/OrdensRowActions";

export const OrdensColumns = [
  {
    accessorKey: "id",
    header: "Orden",
  },
  {
    accessorKey: "tableNumber",
    header: "Mesa",
  },
  {
    accessorKey: "waiter",
    header: "Encargado",
  },
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
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;

      if (status === "pending") return "Pendiente";
      if (status === "completed") return "Completado";
      return status;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <OrdensRowActions order={row.original} />
    ),
  },
];