-- Tabla de inventario (suministros)
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    provision_name VARCHAR(120) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20),
    stock INTEGER DEFAULT 0,
    price NUMERIC(12,2),
    batch VARCHAR(50),
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT NOW()
);
