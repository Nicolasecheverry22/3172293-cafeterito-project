-- Tabla de productos del menú (platillos)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(120) NOT NULL,
    category VARCHAR(100),
    price NUMERIC(12,2) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
