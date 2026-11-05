-- Seed de productos del menú (datos tomados del mock frontend menu.js).
-- Idempotente: ON CONFLICT evita duplicados al reejecutar.
INSERT INTO products (id, product_name, category, price, is_available, description) VALUES
(1,  'Hamburguesa clásica',  'Comida rápida',   18000, true,  'Hamburguesa preparada con carne de res, lechuga, tomate, cebolla y salsas tradicionales.'),
(2,  'Hamburguesa doble',    'Comida rápida',   22000, true,  'Hamburguesa con doble porción de carne de res, queso, lechuga, tomate, cebolla y salsas.'),
(3,  'Pizza pepperoni',      'Comida rápida',   25000, true,  'Pizza con base de salsa de tomate, queso mozzarella y abundantes rodajas de pepperoni.'),
(4,  'Pizza hawaiana',       'Comida rápida',   24000, false, 'Pizza con salsa de tomate, queso mozzarella, jamón y trozos de piña.'),
(5,  'Perro caliente',       'Comida rápida',   12000, true,  'Pan suave con salchicha, acompañado de papas, queso, salsas y vegetales.'),
(6,  'Ensalada César',       'Saludable',       15000, true,  'Ensalada fresca de lechuga, pollo, queso parmesano y crutones con aderezo César.'),
(7,  'Ensalada de frutas',   'Saludable',       13000, true,  'Mezcla de frutas frescas de temporada servidas en una porción refrescante y natural.'),
(8,  'Wrap de pollo',        'Saludable',       17000, false, 'Tortilla de trigo rellena de pollo, lechuga, tomate, queso y aderezo especial.'),
(9,  'Jugo natural',         'Bebidas',          8000, true,  'Jugo preparado con fruta natural y servido frío para acompañar cualquier comida.'),
(10, 'Gaseosa',              'Bebidas',          6000, true,  'Bebida gaseosa fría disponible en una variedad de sabores.'),
(11, 'Agua',                 'Bebidas',          4000, true,  'Agua embotellada fría, ideal para acompañar cualquier comida.'),
(12, 'Malteada',             'Bebidas',         12000, false, 'Bebida cremosa preparada con helado, leche y sabor a elección.'),
(13, 'Café',                 'Bebidas',          5000, true,  'Café caliente preparado con granos seleccionados, ideal para cualquier momento del día.'),
(14, 'Arroz con pollo',      'Platos fuertes',  20000, true,  'Arroz preparado con pollo, vegetales y especias, servido como un plato completo y sustancioso.'),
(15, 'Bandeja paisa',        'Platos fuertes',  28000, true,  'Plato tradicional colombiano con frijoles, arroz, carne molida, chicharrón, huevo, arepa y aguacate.'),
(16, 'Carne asada',          'Platos fuertes',  26000, false, 'Corte de carne de res asado a la parrilla, acompañado de guarniciones tradicionales.'),
(17, 'Pollo a la plancha',   'Platos fuertes',  21000, true,  'Pechuga de pollo sazonada y cocinada a la plancha, acompañada de guarniciones.'),
(18, 'Papas fritas',         'Acompañamientos',  7000, true,  'Papas cortadas y fritas hasta obtener una textura crujiente por fuera y suave por dentro.'),
(19, 'Arepas',               'Acompañamientos',  6000, true,  'Arepas de maíz doradas y calientes, ideales para acompañar diferentes platos.'),
(20, 'Yuca frita',           'Acompañamientos',  6500, false, 'Trozos de yuca fritos hasta quedar dorados y crujientes, ideales como acompañamiento.'),
(21, 'Helado',               'Postres',          8000, true,  'Postre frío y cremoso de helado disponible en diferentes sabores.'),
(22, 'Brownie',              'Postres',          9000, true,  'Brownie de chocolate suave y húmedo, con una textura ligeramente crujiente en los bordes.'),
(23, 'Torta de chocolate',   'Postres',         10000, false, 'Porción de torta de chocolate suave y esponjosa, cubierta con una deliciosa crema de chocolate.'),
(24, 'Sopa del día',         'Entradas',         7000, true,  'Sopa casera preparada con ingredientes frescos y una receta diferente según el día.'),
(25, 'Crema de pollo',       'Entradas',         8500, true,  'Crema caliente y suave preparada con pollo, verduras y un toque de especias.')
ON CONFLICT (id) DO NOTHING;

-- Ajusta la secuencia del id para que los próximos INSERT no choquen con los ids sembrados.
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT COALESCE(MAX(id), 1) FROM products));
