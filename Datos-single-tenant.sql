-- =========================================
-- FINOPEN POS - ESQUEMA SINGLE-TENANT (user_uid)
-- Compatible con el código Next.js que filtra por user_uid y usa categories en transactions
-- =========================================

-- 1) LIMPIEZA (¡destruye tablas si existen!)
DROP TABLE IF EXISTS debt_payments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;

-- 2) ESQUEMA BASE (single-tenant con user_uid)

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    in_stock INTEGER NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    user_uid VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    debt DECIMAL(10, 2) DEFAULT 0.00
);

-- Orders (customer_id puede ser NULL para ventas sin cliente)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_credit_sale BOOLEAN DEFAULT FALSE
);

-- OrderItems
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- PaymentMethods
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description TEXT,
    order_id INTEGER REFERENCES orders(id),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')),
    category VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debt payments (para pagos de deuda de ventas al fiado)
CREATE TABLE debt_payments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    amount DECIMAL(10, 2) NOT NULL,
    order_ids INTEGER[],
    user_uid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Índices útiles por user_uid
CREATE INDEX IF NOT EXISTS idx_products_user_uid ON products(user_uid);
CREATE INDEX IF NOT EXISTS idx_customers_user_uid ON customers(user_uid);
CREATE INDEX IF NOT EXISTS idx_orders_user_uid ON orders(user_uid);
CREATE INDEX IF NOT EXISTS idx_transactions_user_uid ON transactions(user_uid);
CREATE INDEX IF NOT EXISTS idx_debt_payments_user_uid ON debt_payments(user_uid);

-- 3) SEED BÁSICO
INSERT INTO payment_methods (name) VALUES 
    ('Tarjeta de Crédito'), 
    ('Tarjeta de Débito'), 
    ('Efectivo')
ON CONFLICT (name) DO NOTHING;

-- Cambia 'TU_USER_UID_AQUI' por tu UID real (SELECT auth.uid();)
INSERT INTO products (name, description, price, in_stock, user_uid, category) VALUES 
('Arroz Blanco 1kg', 'Arroz blanco de grano largo, marca premium', 3.50, 100, 'TU_USER_UID_AQUI', 'comestibles'),
('Frijoles Negros 500g', 'Frijoles negros secos, alta calidad', 2.25, 80, 'TU_USER_UID_AQUI', 'comestibles'),
('Coca Cola 2L', 'Refresco de cola, botella de 2 litros', 2.80, 150, 'TU_USER_UID_AQUI', 'bebidas');

INSERT INTO customers (name, email, phone, user_uid, status) VALUES 
('Cliente General', 'cliente@general.com', '555-0001', 'TU_USER_UID_AQUI', 'active')
ON CONFLICT (email) DO NOTHING;

-- 4) RLS (Row Level Security) por user_uid
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas si existieran
DO $$
BEGIN
  -- products
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products') THEN
    DROP POLICY IF EXISTS "Users can view own products" ON products;
    DROP POLICY IF EXISTS "Users can insert own products" ON products;
    DROP POLICY IF EXISTS "Users can update own products" ON products;
    DROP POLICY IF EXISTS "Users can delete own products" ON products;
  END IF;
  -- customers
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers') THEN
    DROP POLICY IF EXISTS "Users can view own customers" ON customers;
    DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
    DROP POLICY IF EXISTS "Users can update own customers" ON customers;
    DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
  END IF;
  -- orders
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders') THEN
    DROP POLICY IF EXISTS "Users can view own orders" ON orders;
    DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
    DROP POLICY IF EXISTS "Users can update own orders" ON orders;
  END IF;
  -- order_items
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items') THEN
    DROP POLICY IF EXISTS "Users can view own order_items" ON order_items;
    DROP POLICY IF EXISTS "Users can insert own order_items" ON order_items;
  END IF;
  -- transactions
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
  END IF;
  -- debt_payments
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'debt_payments') THEN
    DROP POLICY IF EXISTS "Users can view own debt_payments" ON debt_payments;
    DROP POLICY IF EXISTS "Users can insert own debt_payments" ON debt_payments;
  END IF;
  -- payment_methods
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_methods') THEN
    DROP POLICY IF EXISTS "Everyone can view payment_methods" ON payment_methods;
  END IF;
END $$;

-- Nuevas políticas por user_uid
-- products
CREATE POLICY "Users can view own products" ON products FOR SELECT USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (user_uid = auth.uid()::text);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (user_uid = auth.uid()::text);

-- customers
CREATE POLICY "Users can view own customers" ON customers FOR SELECT USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can insert own customers" ON customers FOR INSERT WITH CHECK (user_uid = auth.uid()::text);
CREATE POLICY "Users can update own customers" ON customers FOR UPDATE USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can delete own customers" ON customers FOR DELETE USING (user_uid = auth.uid()::text);

-- orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (user_uid = auth.uid()::text);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (user_uid = auth.uid()::text);

-- order_items (vía relación con orders)
CREATE POLICY "Users can view own order_items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_uid = auth.uid()::text
    )
  );
CREATE POLICY "Users can insert own order_items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_uid = auth.uid()::text
    )
  );

-- transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (user_uid = auth.uid()::text);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (user_uid = auth.uid()::text);

-- debt_payments
CREATE POLICY "Users can view own debt_payments" ON debt_payments FOR SELECT USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can insert own debt_payments" ON debt_payments FOR INSERT WITH CHECK (user_uid = auth.uid()::text);

-- payment_methods: lectura pública
CREATE POLICY "Everyone can view payment_methods" ON payment_methods FOR SELECT USING (true);

-- 5) SISTEMA DE ROLES (admin/cajero)

-- Función para asignar rol 'cajero' por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Asignar rol 'cajero' por defecto a nuevos usuarios
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'cajero')
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para usuarios nuevos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', 'cajero')
    FROM auth.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ⚠️ IMPORTANTE: Cambiar 'tu-email@ejemplo.com' por tu email real para asignarte rol admin
UPDATE auth.users 
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'admin')
WHERE email = 'tu-email@ejemplo.com';

-- Consulta para ver usuarios y sus roles
-- SELECT id, email, raw_user_meta_data->>'role' as role, created_at FROM auth.users ORDER BY created_at;

-- 6) NOTAS
-- - Sustituye 'TU_USER_UID_AQUI' antes de ejecutar, o ejecuta luego fix-user-data.sql para ajustar al usuario actual.
-- - Cambia 'tu-email@ejemplo.com' por tu email real para obtener rol admin.
-- - Asegúrate de autenticarte en la app con el mismo usuario para que las APIs filtren los datos correctamente.
