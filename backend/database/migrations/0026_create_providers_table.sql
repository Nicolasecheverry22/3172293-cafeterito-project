-- Tabla de proveedores (estructura basada en el mock frontend providers.js).
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  nit VARCHAR(30),
  provider_name VARCHAR(150) NOT NULL,
  provider_email VARCHAR(150),
  provider_phone VARCHAR(30),
  provider_address VARCHAR(255),
  product_service TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
