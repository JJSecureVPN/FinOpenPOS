-- =========================================
-- FINOPEN POS - ESQUEMA SINGLE-TENANT (user_uid) - PERSONALIZADO
-- Compatible con el código Next.js que filtra por user_uid y usa categories en transactions
-- =========================================

-- INSTRUCCIONES ANTES DE EJECUTAR:
-- 1. En Supabase SQL Editor, ejecuta primero: SELECT auth.uid();
-- 2. Copia el resultado (tu UID) y reemplaza 'TU_USER_UID_AQUI' en este script
-- 3. Reemplaza 'TU_EMAIL_AQUI' con tu email real de Supabase Auth
-- 4. Ejecuta todo este script

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

-- 3) SEED BÁSICO (solo métodos de pago)
INSERT INTO payment_methods (name) VALUES 
    ('Tarjeta de Crédito'), 
    ('Tarjeta de Débito'), 
    ('Efectivo')
ON CONFLICT (name) DO NOTHING;

-- ✅ BASE DE DATOS LIMPIA - SIN DATOS DEMO
-- Para agregar tus propios datos:
-- 1. Reemplaza 'TU_USER_UID_AQUI' con tu UID real de Supabase
-- 2. Reemplaza 'TU_EMAIL_AQUI' con tu email real
-- 3. Agrega tus productos y clientes usando la interfaz del sistema

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
  DROP POLICY IF EXISTS "Users can view own products" ON products;
  DROP POLICY IF EXISTS "Users can insert own products" ON products;
  DROP POLICY IF EXISTS "Users can update own products" ON products;
  DROP POLICY IF EXISTS "Users can delete own products" ON products;
  
  -- customers
  DROP POLICY IF EXISTS "Users can view own customers" ON customers;
  DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
  DROP POLICY IF EXISTS "Users can update own customers" ON customers;
  DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
  
  -- orders
  DROP POLICY IF EXISTS "Users can view own orders" ON orders;
  DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
  DROP POLICY IF EXISTS "Users can update own orders" ON orders;
  
  -- order_items
  DROP POLICY IF EXISTS "Users can view own order_items" ON order_items;
  DROP POLICY IF EXISTS "Users can insert own order_items" ON order_items;
  
  -- transactions
  DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
  DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
  DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
  DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
  
  -- debt_payments
  DROP POLICY IF EXISTS "Users can view own debt_payments" ON debt_payments;
  DROP POLICY IF EXISTS "Users can insert own debt_payments" ON debt_payments;
  
  -- payment_methods
  DROP POLICY IF EXISTS "Everyone can view payment_methods" ON payment_methods;
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
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (user_uid = auth.uid()::text);

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

-- ✅ CONFIGURACIÓN DE USUARIO (PERSONALIZAR ANTES DE EJECUTAR)
-- Reemplaza estos valores antes de ejecutar el script:
-- USER_UID: Obtén tu UID ejecutando SELECT auth.uid(); en Supabase
-- EMAIL: Tu email real de autenticación en Supabase
UPDATE auth.users 
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'admin')
WHERE email = 'jazmicardozoh05@gmail.com';

-- 6) VERIFICACIONES (después de ejecutar y personalizar)
-- Ejecuta estas consultas para verificar la configuración:

-- Verificar tu rol de usuario:
-- SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users WHERE email = 'TU_EMAIL_AQUI';

-- Verificar que puedes acceder a las tablas:
-- SELECT COUNT(*) as total_productos FROM products WHERE user_uid = auth.uid()::text;

-- Verificar las funciones de rol:
-- SELECT public.get_user_role() as mi_rol, public.is_admin() as soy_admin;

-- ✅ BASE DE DATOS LIMPIA - LISTA PARA USAR
-- INSTRUCCIONES DE PERSONALIZACIÓN:
-- 1. Reemplaza 'TU_EMAIL_AQUI' con tu email real de Supabase Auth
-- 2. Ejecuta todo este script en el SQL Editor de Supabase
-- 3. Usa la interfaz del sistema para agregar productos y clientes