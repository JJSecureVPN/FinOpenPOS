-- =========================================
-- FINOPEN POS - SISTEMA MULTI-TENANT
-- =========================================

-- =============================
-- 1. LIMPIAR TABLAS EXISTENTES
-- =============================

-- Drop tables if they exist
DROP TABLE IF EXISTS debt_payments;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS companies;

-- =============================
-- 2. CREAR TABLA DE EMPRESAS
-- =============================

-- Tabla para manejar múltiples empresas/tiendas
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    admin_id UUID NOT NULL, -- El admin que creó/posee esta empresa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    
    -- Información adicional de la empresa
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_id VARCHAR(50),
    
    UNIQUE(admin_id) -- Un admin solo puede tener una empresa
);

-- =============================
-- 3. CREAR ESTRUCTURA DE TABLAS
-- =============================

-- Create Products table (ahora vinculada a empresa)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    in_stock INTEGER NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table (vinculada a empresa)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    debt DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Un email puede repetirse entre empresas, pero no dentro de la misma empresa
    UNIQUE(email, company_id)
);

-- Create Orders table (vinculada a empresa)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL, -- El usuario (admin o cajero) que creó la orden
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    is_credit_sale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create OrderItems table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Create PaymentMethods table (global para todas las empresas)
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create Transactions table (vinculada a empresa)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description TEXT,
    order_id INTEGER REFERENCES orders(id),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL, -- El usuario que registró la transacción
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) DEFAULT 'income',
    category VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para pagos de deuda (vinculada a empresa)
CREATE TABLE debt_payments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    amount DECIMAL(10, 2) NOT NULL,
    order_ids INTEGER[],
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- =============================
-- 3. DATOS INICIALES
-- =============================

-- Insert initial payment methods
INSERT INTO payment_methods (name) VALUES 
    ('Credit Card'), 
    ('Debit Card'), 
    ('Cash');

-- =============================
-- 4. SISTEMA DE ROLES
-- =============================

-- Crear función para asignar roles por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Asignar rol 'cashier' por defecto a nuevos usuarios
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'cashier')
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para usuarios nuevos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================
-- 5. CONFIGURACIÓN DE ADMIN
-- =============================

-- ⚠️ IMPORTANTE: Cambiar 'tu-email@ejemplo.com' por tu email real
UPDATE auth.users 
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'admin')
WHERE email = 'tu-email@ejemplo.com';

-- =============================
-- 6. CONSULTAS ÚTILES
-- =============================

-- Ver todos los usuarios y sus roles
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- =============================
-- 7. POLÍTICAS DE SEGURIDAD RLS
-- =============================

-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para products (solo el usuario dueño puede ver/editar)
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid()::text = user_uid);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid()::text = user_uid);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid()::text = user_uid);

-- Políticas para customers
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid()::text = user_uid);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid()::text = user_uid);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid()::text = user_uid);

-- Políticas para orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_uid);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid()::text = user_uid);

-- Políticas para order_items (acceso a través de orders)
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

-- Políticas para transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_uid);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid()::text = user_uid);

-- Políticas para debt_payments
CREATE POLICY "Users can view own debt_payments" ON debt_payments
  FOR SELECT USING (auth.uid()::text = user_uid);

CREATE POLICY "Users can insert own debt_payments" ON debt_payments
  FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

-- Payment methods - acceso público para lectura
CREATE POLICY "Everyone can view payment_methods" ON payment_methods
  FOR SELECT USING (true);

-- =============================
-- 8. COMANDOS PARA GESTIÓN DE ROLES
-- =============================

-- Para asignar rol de admin a un usuario:
-- UPDATE auth.users 
-- SET raw_user_meta_data = 
--   COALESCE(raw_user_meta_data, '{}'::jsonb) || 
--   jsonb_build_object('role', 'admin')
-- WHERE email = 'email-del-usuario@ejemplo.com';

-- Para asignar rol de cajero a un usuario:
-- UPDATE auth.users 
-- SET raw_user_meta_data = 
--   COALESCE(raw_user_meta_data, '{}'::jsonb) || 
--   jsonb_build_object('role', 'cashier')
-- WHERE email = 'email-del-usuario@ejemplo.com';

-- =============================
-- INSTALACIÓN COMPLETA ✅
-- =============================

-- 🎉 ¡Configuración completa!
-- 
-- PASOS SIGUIENTES:
-- 1. Cambiar 'tu-email@ejemplo.com' por tu email real en la línea 97
-- 2. Ejecutar este script completo
-- 3. Verificar que tu usuario tenga rol 'admin' con la consulta de la línea 105
-- 4. ¡Probar el sistema de roles en la aplicación!