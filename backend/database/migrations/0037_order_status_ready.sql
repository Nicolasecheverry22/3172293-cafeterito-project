-- 0037: estado "lista para entrega" en órdenes (H50, RFADMIN30).
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_status;
ALTER TABLE orders ADD CONSTRAINT chk_orders_status
    CHECK (status IN ('activa', 'lista para entrega', 'pagada', 'cancelada'));

-- Una mesa solo puede tener UNA orden abierta: 'activa' o 'lista para entrega'.
DROP INDEX IF EXISTS uq_orders_active_table;
CREATE UNIQUE INDEX uq_orders_active_table
    ON orders (table_number)
    WHERE status IN ('activa', 'lista para entrega');
