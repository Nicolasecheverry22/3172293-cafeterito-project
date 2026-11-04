export const inventory = [
  // Carnes
  { id: 1, provisionName: "Pollo", category: "Carnes", stock: 28, unit: "kg", price: 12000, minStock: 10, maxStock: 50, batch: "LOT-101A", status: "Activo" },
  { id: 2, provisionName: "Pollo", category: "Carnes", stock: 2, unit: "kg", price: 12000, minStock: 10, maxStock: 50, batch: "LOT-101B", status: "Vencido" },
  { id: 3, provisionName: "Carne de res", category: "Carnes", stock: 20, unit: "kg", price: 15000, minStock: 8, maxStock: 40, batch: "LOT-102", status: "Activo" },
  { id: 4, provisionName: "Cerdo", category: "Carnes", stock: 22, unit: "kg", price: 13000, minStock: 8, maxStock: 35, batch: "LOT-103A", status: "Activo" },
  { id: 5, provisionName: "Cerdo", category: "Carnes", stock: 3, unit: "kg", price: 13000, minStock: 8, maxStock: 35, batch: "LOT-103B", status: "Averia" },
  { id: 6, provisionName: "Pescado", category: "Carnes", stock: 0, unit: "kg", price: 14000, minStock: 5, maxStock: 25, batch: "LOT-104", status: "Agotado" },

  // Verduras
  { id: 7, provisionName: "Lechuga", category: "Verduras", stock: 15, unit: "kg", price: 2000, minStock: 5, maxStock: 25, batch: "LOT-201A", status: "Activo" },
  { id: 8, provisionName: "Lechuga", category: "Verduras", stock: 5, unit: "kg", price: 2000, minStock: 5, maxStock: 25, batch: "LOT-201B", status: "Vencido" },
  { id: 9, provisionName: "Tomate", category: "Verduras", stock: 25, unit: "kg", price: 2500, minStock: 10, maxStock: 45, batch: "LOT-202", status: "Activo" },
  { id: 10, provisionName: "Cebolla", category: "Verduras", stock: 26, unit: "kg", price: 1800, minStock: 10, maxStock: 50, batch: "LOT-203A", status: "Activo" },
  { id: 11, provisionName: "Cebolla", category: "Verduras", stock: 4, unit: "kg", price: 1800, minStock: 10, maxStock: 50, batch: "LOT-203B", status: "Averia" },
  { id: 12, provisionName: "Zanahoria", category: "Verduras", stock: 18, unit: "kg", price: 1700, minStock: 8, maxStock: 35, batch: "LOT-204", status: "Activo" },
  { id: 13, provisionName: "Pimentón", category: "Verduras", stock: 12, unit: "kg", price: 3000, minStock: 5, maxStock: 25, batch: "LOT-205", status: "Activo" },

  // Tubérculos
  { id: 14, provisionName: "Papa", category: "Tubérculos", stock: 35, unit: "kg", price: 1800, minStock: 15, maxStock: 70, batch: "LOT-301A", status: "Activo" },
  { id: 15, provisionName: "Papa", category: "Tubérculos", stock: 5, unit: "kg", price: 1800, minStock: 15, maxStock: 70, batch: "LOT-301B", status: "Vencido" },
  { id: 16, provisionName: "Yuca", category: "Tubérculos", stock: 22, unit: "kg", price: 1600, minStock: 10, maxStock: 40, batch: "LOT-302", status: "Activo" },
  { id: 17, provisionName: "Plátano", category: "Tubérculos", stock: 30, unit: "kg", price: 2000, minStock: 12, maxStock: 50, batch: "LOT-303A", status: "Activo" },
  { id: 18, provisionName: "Plátano", category: "Tubérculos", stock: 5, unit: "kg", price: 2000, minStock: 12, maxStock: 50, batch: "LOT-303B", status: "Averia" },

  // Granos
  { id: 19, provisionName: "Arroz", category: "Granos", stock: 50, unit: "kg", price: 3000, minStock: 20, maxStock: 100, batch: "LOT-401", status: "Activo" },
  { id: 20, provisionName: "Lentejas", category: "Granos", stock: 18, unit: "kg", price: 2800, minStock: 8, maxStock: 40, batch: "LOT-402A", status: "Activo" },
  { id: 21, provisionName: "Lentejas", category: "Granos", stock: 2, unit: "kg", price: 2800, minStock: 8, maxStock: 40, batch: "LOT-402B", status: "Averia" },
  { id: 22, provisionName: "Frijoles", category: "Granos", stock: 25, unit: "kg", price: 3200, minStock: 10, maxStock: 50, batch: "LOT-403", status: "Activo" },

  // Lácteos
  { id: 23, provisionName: "Leche", category: "Lácteos", stock: 34, unit: "litros", price: 3500, minStock: 15, maxStock: 60, batch: "LOT-501A", status: "Activo" },
  { id: 24, provisionName: "Leche", category: "Lácteos", stock: 6, unit: "litros", price: 3500, minStock: 15, maxStock: 60, batch: "LOT-501B", status: "Vencido" },
  { id: 25, provisionName: "Queso", category: "Lácteos", stock: 15, unit: "kg", price: 10000, minStock: 5, maxStock: 30, batch: "LOT-502", status: "Activo" },
  { id: 26, provisionName: "Mantequilla", category: "Lácteos", stock: 0, unit: "kg", price: 9000, minStock: 3, maxStock: 15, batch: "LOT-503", status: "Agotado" },
  { id: 27, provisionName: "Huevos", category: "Lácteos", stock: 110, unit: "unidades", price: 400, minStock: 60, maxStock: 300, batch: "LOT-504A", status: "Activo" },
  { id: 28, provisionName: "Huevos", category: "Lácteos", stock: 10, unit: "unidades", price: 400, minStock: 60, maxStock: 300, batch: "LOT-504B", status: "Averia" },

  // Insumos
  { id: 29, provisionName: "Sal", category: "Insumos", stock: 20, unit: "kg", price: 1000, minStock: 10, maxStock: 50, batch: "LOT-601", status: "Activo" },
  { id: 30, provisionName: "Azúcar", category: "Insumos", stock: 25, unit: "kg", price: 2500, minStock: 10, maxStock: 50, batch: "LOT-602", status: "Activo" },
  { id: 31, provisionName: "Aceite", category: "Insumos", stock: 13, unit: "litros", price: 8000, minStock: 8, maxStock: 30, batch: "LOT-603A", status: "Activo" },
  { id: 32, provisionName: "Aceite", category: "Insumos", stock: 2, unit: "litros", price: 8000, minStock: 8, maxStock: 30, batch: "LOT-603B", status: "Vencido" },
  { id: 33, provisionName: "Vinagre", category: "Insumos", stock: 10, unit: "litros", price: 5000, minStock: 4, maxStock: 20, batch: "LOT-604", status: "Activo" },

  // Panadería
  { id: 34, provisionName: "Harina", category: "Panadería", stock: 30, unit: "kg", price: 2700, minStock: 15, maxStock: 75, batch: "LOT-701", status: "Activo" },
  { id: 35, provisionName: "Pan", category: "Panadería", stock: 85, unit: "unidades", price: 500, minStock: 30, maxStock: 150, batch: "LOT-702A", status: "Activo" },
  { id: 36, provisionName: "Pan", category: "Panadería", stock: 15, unit: "unidades", price: 500, minStock: 30, maxStock: 150, batch: "LOT-702B", status: "Vencido" },
  { id: 37, provisionName: "Levadura", category: "Panadería", stock: 0, unit: "kg", price: 6000, minStock: 2, maxStock: 10, batch: "LOT-703", status: "Agotado" },

  // Bebidas
  { id: 38, provisionName: "Gaseosa", category: "Bebidas", stock: 45, unit: "unidades", price: 3000, minStock: 24, maxStock: 120, batch: "LOT-801A", status: "Activo" },
  { id: 39, provisionName: "Gaseosa", category: "Bebidas", stock: 5, unit: "unidades", price: 3000, minStock: 24, maxStock: 120, batch: "LOT-801B", status: "Averia" },
  { id: 40, provisionName: "Jugo natural", category: "Bebidas", stock: 25, unit: "litros", price: 4000, minStock: 10, maxStock: 40, batch: "LOT-802A", status: "Activo" },
  { id: 41, provisionName: "Jugo natural", category: "Bebidas", stock: 5, unit: "litros", price: 4000, minStock: 10, maxStock: 40, batch: "LOT-802B", status: "Vencido" },
  { id: 42, provisionName: "Agua", category: "Bebidas", stock: 60, unit: "unidades", price: 2000, minStock: 30, maxStock: 150, batch: "LOT-803", status: "Activo" },

  // Salsas
  { id: 43, provisionName: "Mayonesa", category: "Salsas", stock: 10, unit: "litros", price: 7000, minStock: 4, maxStock: 20, batch: "LOT-901A", status: "Activo" },
  { id: 44, provisionName: "Mayonesa", category: "Salsas", stock: 2, unit: "litros", price: 7000, minStock: 4, maxStock: 20, batch: "LOT-901B", status: "Vencido" },
  { id: 45, provisionName: "Ketchup", category: "Salsas", stock: 14, unit: "litros", price: 6500, minStock: 5, maxStock: 25, batch: "LOT-902", status: "Activo" },
  { id: 46, provisionName: "Mostaza", category: "Salsas", stock: 9, unit: "litros", price: 6000, minStock: 3, maxStock: 15, batch: "LOT-903A", status: "Activo" },
  { id: 47, provisionName: "Mostaza", category: "Salsas", stock: 1, unit: "litros", price: 6000, minStock: 3, maxStock: 15, batch: "LOT-903B", status: "Averia" },

  // Provisiones adicionales
  { id: 48, provisionName: "Café", category: "Insumos", stock: 15, unit: "kg", price: 18000, minStock: 5, maxStock: 30, batch: "LOT-605", status: "Activo" },
  { id: 49, provisionName: "Mermelada", category: "Salsas", stock: 8, unit: "litros", price: 8500, minStock: 3, maxStock: 15, batch: "LOT-904", status: "Activo" },
  { id: 50, provisionName: "Avena", category: "Granos", stock: 0, unit: "kg", price: 3500, minStock: 5, maxStock: 25, batch: "LOT-404", status: "Agotado" }
];