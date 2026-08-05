export const inventoryReportFields = [
  { key: "productName", label: "Producto", default: true },
  { key: "category", label: "Categoría", default: true },
  { key: "stock", label: "Stock", default: true },
  { key: "unit", label: "Unidad", default: true },
  {
    key: "price",
    label: "Precio",
    default: true,
    format: (value) => `$ ${value.toLocaleString()}`
  }
];