import MenuRowActions from "../components/MenuRowActions";

export const MenuColumns = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "productName",
    header: "Platillo",
  },
  {
    accessorKey: "category",
    header: "Categoría",
  },
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
  {
    accessorKey: "isAvailable",
    header: "Estado",
    cell: ({ row }) => {
      return row.original.isAvailable ? "Disponible" : "No disponible";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <MenuRowActions product={row.original} />
    ),
  },
];