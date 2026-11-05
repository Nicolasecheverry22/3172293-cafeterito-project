-- Órdenes de la cafetería (encabezado + detalle). Idempotente.

-- Encabezado: una orden por mesa atendida por un empleado.
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    table_number INTEGER NOT NULL,
    waiter_id INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'activa',
    observations VARCHAR(300),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_orders_table_number CHECK (table_number > 0),
    CONSTRAINT chk_orders_status CHECK (status IN ('activa', 'pagada', 'cancelada')),
    -- Si se elimina el empleado, la orden se conserva (historial de ventas).
    CONSTRAINT fk_orders_waiter
        FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Detalle: platillos de cada orden.
-- unit_price guarda el precio AL MOMENTO de la venta: si luego cambia el precio
-- en products, las órdenes antiguas no se alteran.
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    is_dispatched BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0),
    -- Un platillo aparece una sola vez por orden (se suma la cantidad).
    CONSTRAINT uq_order_items_order_product UNIQUE (order_id, product_id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    -- No se permite borrar un producto que ya fue vendido.
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Índices para los filtros/joins más frecuentes.
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id  ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Regla de negocio en BD: una mesa solo puede tener UNA orden activa a la vez.
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_active_table
    ON orders(table_number)
    WHERE status = 'activa';

-- El total no se guarda (sería un dato derivado que puede desincronizarse);
-- se calcula con esta vista.
CREATE OR REPLACE VIEW orders_summary AS
SELECT
    o.id,
    o.table_number,
    o.waiter_id,
    u.user_name AS waiter_name,
    o.status,
    o.observations,
    o.created_at,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0)::NUMERIC(12,2) AS total
FROM orders o
LEFT JOIN users u        ON u.id = o.waiter_id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, u.user_name;
