-- 0040: comprobantes de venta (facturación interna, sin validez fiscal). Idempotente.
-- Un comprobante por orden; al emitirlo la orden pasa a 'pagada' en la misma transacción
-- (ver src/features/invoices/invoice.service.js). Nunca se borra ni se edita: solo se anula.

-- 1. Consecutivo: nextval nunca devuelve un número ya entregado, aunque el comprobante
--    se anule o la transacción haga ROLLBACK (los huecos son esperados).
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- 2. Encabezado. Mesa, mesero, precios y totales se COPIAN: el comprobante no cambia
--    si luego se edita la orden, el producto o el usuario.
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) NOT NULL,
    order_id INTEGER NOT NULL,
    cashier_id INTEGER,
    waiter_id INTEGER,
    table_number INTEGER NOT NULL,
    customer_name VARCHAR(100) NOT NULL DEFAULT 'Consumidor final',
    customer_document_type VARCHAR(10),
    customer_document VARCHAR(15),
    payment_method VARCHAR(20) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    tax_rate NUMERIC(5,4) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL,
    tip NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    amount_received NUMERIC(12,2),
    change_given NUMERIC(12,2),
    status VARCHAR(10) NOT NULL DEFAULT 'emitida',
    void_reason VARCHAR(300),
    voided_by INTEGER,
    voided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_invoices_number UNIQUE (invoice_number),
    -- Una orden se cobra una sola vez (segunda barrera además del FOR UPDATE)
    CONSTRAINT uq_invoices_order UNIQUE (order_id),
    CONSTRAINT fk_invoices_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_cashier
        FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoices_waiter
        FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoices_voided_by
        FOREIGN KEY (voided_by) REFERENCES users(id),
    CONSTRAINT chk_invoices_document_type
        CHECK (customer_document_type IN ('CC', 'CE', 'NIT', 'PEP', 'PPT')),
    CONSTRAINT chk_invoices_payment_method
        CHECK (payment_method IN ('efectivo', 'tarjeta', 'transferencia')),
    CONSTRAINT chk_invoices_amounts CHECK (
        subtotal >= 0 AND tax_rate >= 0 AND tax_amount >= 0 AND tip >= 0 AND total >= 0
    ),
    CONSTRAINT chk_invoices_total CHECK (total = subtotal + tax_amount + tip),
    -- Recibido y cambio solo existen en efectivo (y el recibido cubre el total)
    CONSTRAINT chk_invoices_cash CHECK (
        (payment_method = 'efectivo'
            AND amount_received IS NOT NULL AND amount_received >= total
            AND change_given = amount_received - total)
        OR (payment_method <> 'efectivo'
            AND amount_received IS NULL AND change_given IS NULL)
    ),
    CONSTRAINT chk_invoices_status CHECK (status IN ('emitida', 'anulada')),
    CONSTRAINT chk_invoices_void CHECK (
        status <> 'anulada' OR (void_reason IS NOT NULL AND voided_at IS NOT NULL)
    )
);

-- 3. Detalle: nombre y precio del platillo al momento del cobro.
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,
    CONSTRAINT fk_invoice_items_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoice_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_invoice_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_invoice_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_invoice_items_line_total CHECK (line_total = quantity * unit_price)
);

-- 4. Índices para los filtros del listado y del reporte.
CREATE INDEX IF NOT EXISTS idx_invoices_created_at     ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_status         ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_method ON invoices(payment_method);
CREATE INDEX IF NOT EXISTS idx_invoices_cashier_id     ON invoices(cashier_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 5. Permisos (mismo formato que 0030).
INSERT INTO content_type (app_label, model, display_name)
VALUES ('invoices', 'invoice', 'Comprobantes de venta')
ON CONFLICT (app_label, model) DO NOTHING;

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
SELECT v.name, v.codename, ct.content_type_id
FROM (VALUES
    ('Generar comprobantes de venta',       'create_invoice'),
    ('Listar comprobantes de venta',        'list_invoice'),
    ('Visualizar comprobantes de venta',    'view_invoice'),
    ('Anular comprobantes de venta',        'void_invoice'),
    ('Generar reporte de comprobantes',     'report_invoice')
) AS v(name, codename)
JOIN content_type ct ON ct.app_label = 'invoices' AND ct.model = 'invoice'
ON CONFLICT (permission_codename) DO NOTHING;

-- Administrador: todos. Caja: todos menos anular.
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
JOIN permissions p ON p.permission_codename IN
    ('create_invoice', 'list_invoice', 'view_invoice', 'void_invoice', 'report_invoice')
WHERE g.group_name = 'Administrador'
ON CONFLICT (group_id, permission_id) DO NOTHING;

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
JOIN permissions p ON p.permission_codename IN
    ('create_invoice', 'list_invoice', 'view_invoice', 'report_invoice')
WHERE g.group_name = 'Caja'
ON CONFLICT (group_id, permission_id) DO NOTHING;
