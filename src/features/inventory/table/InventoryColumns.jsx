// Columnas de la tabla de inventario
// Usado normalmente con librerías como TanStack Table

import InventoryRowActions from "../components/InventoryRowActions";


// Definición de columnas del módulo Inventory
export const InventoryColumns = [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },


  // Columna Nombre del producto
  {
    accessorKey: "productName",
    header: "Producto",
  },


  // Columna Categoría
  {
    accessorKey: "category",
    header: "Categoría",
  },


  // Columna cantidad disponible
  {
    accessorKey: "stock",
    header: "Stock",
  },


  // Columna unidad de medida
  {
    accessorKey: "unit",
    header: "Unidad",
  },


  // Columna precio
  {
    accessorKey: "price",
    header: "Precio",


    // Render personalizado para mostrar moneda colombiana
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


  // Columna acciones
  {
    id: "actions",

    cell: ({ row }) => (
      <InventoryRowActions product={row.original} />
    ),
  },

];