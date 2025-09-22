-- Drop tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS payment_methods;

-- Create Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    in_stock INTEGER NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    category VARCHAR(50)
);

-- Create Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    user_uid VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create OrderItems table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Create PaymentMethods table
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description TEXT,
    order_id INTEGER REFERENCES orders(id),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')),
    category VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial payment methods
INSERT INTO payment_methods (name) VALUES ('Tarjeta de Crédito'), ('Tarjeta de Débito'), ('Efectivo');

-- Insert sample products for warehouse/store
INSERT INTO products (name, description, price, in_stock, user_uid, category) VALUES 
('Arroz Blanco 1kg', 'Arroz blanco de grano largo, marca premium', 3.50, 100, 'sample-user', 'comestibles'),
('Frijoles Negros 500g', 'Frijoles negros secos, alta calidad', 2.25, 80, 'sample-user', 'comestibles'),
('Aceite de Cocina 1L', 'Aceite vegetal para cocinar, marca líder', 4.75, 60, 'sample-user', 'comestibles'),
('Papas Fritas Grandes', 'Papas fritas sabor natural, bolsa familiar', 2.50, 120, 'sample-user', 'snacks'),
('Galletas Saladas', 'Galletas saladas integrales, paquete de 6', 1.80, 90, 'sample-user', 'snacks'),
('Doritos Nacho', 'Chips de maíz sabor queso nacho', 2.20, 75, 'sample-user', 'snacks'),
('Coca Cola 2L', 'Refresco de cola, botella de 2 litros', 2.80, 150, 'sample-user', 'bebidas'),
('Agua Natural 1L', 'Agua purificada en botella de 1 litro', 1.20, 200, 'sample-user', 'bebidas'),
('Jugo de Naranja 1L', 'Jugo natural de naranja, 100% fruta', 3.20, 85, 'sample-user', 'bebidas'),
('Chocolate con Leche', 'Barra de chocolate con leche, 100g', 1.50, 95, 'sample-user', 'dulces'),
('Caramelos Surtidos', 'Bolsa de caramelos de sabores variados', 2.10, 110, 'sample-user', 'dulces'),
('Chicles Menta', 'Paquete de chicles sabor menta fresca', 0.85, 130, 'sample-user', 'dulces'),
('Detergente Líquido 1L', 'Detergente líquido para ropa, aroma lavanda', 5.50, 45, 'sample-user', 'limpieza'),
('Jabón para Platos 500ml', 'Jabón líquido concentrado para trastes', 2.90, 70, 'sample-user', 'limpieza'),
('Papel Higiénico 4 rollos', 'Papel higiénico suave, paquete de 4 rollos', 4.20, 55, 'sample-user', 'higiene'),
('Shampoo Anticaspa 400ml', 'Shampoo medicado contra la caspa', 6.80, 35, 'sample-user', 'higiene'),
('Pasta Dental 150g', 'Pasta dental con flúor, sabor menta', 3.40, 65, 'sample-user', 'higiene');

-- Insert sample customers
INSERT INTO customers (name, email, phone, user_uid, status) VALUES 
('María González', 'maria.gonzalez@email.com', '555-0101', 'sample-user', 'active'),
('Juan Pérez', 'juan.perez@email.com', '555-0102', 'sample-user', 'active'),
('Ana Martínez', 'ana.martinez@email.com', '555-0103', 'sample-user', 'active'),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', '555-0104', 'sample-user', 'inactive'),
('Sofia López', 'sofia.lopez@email.com', '555-0105', 'sample-user', 'active');