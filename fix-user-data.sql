-- Este script actualiza los datos de muestra para que correspondan a tu usuario
-- IMPORTANTE: Reemplaza 'TU_USER_UID_AQUI' con tu user_uid real de Supabase

-- Primero, verifica tu user_uid actual ejecutando:
-- SELECT auth.uid();

-- Luego reemplaza 'TU_USER_UID_AQUI' con el resultado y ejecuta este script:

-- Actualizar productos existentes
UPDATE products 
SET user_uid = 'TU_USER_UID_AQUI' 
WHERE user_uid = 'sample-user';

-- Actualizar clientes existentes  
UPDATE customers 
SET user_uid = 'TU_USER_UID_AQUI' 
WHERE user_uid = 'sample-user';

-- Si no hay productos, insertarlos con tu user_uid
INSERT INTO products (name, description, price, in_stock, user_uid, category) 
SELECT 'Arroz Blanco 1kg', 'Arroz blanco de grano largo', 3.50, 100, 'TU_USER_UID_AQUI', 'comestibles'
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE user_uid = 'TU_USER_UID_AQUI' AND name = 'Arroz Blanco 1kg'
);

INSERT INTO products (name, description, price, in_stock, user_uid, category) 
SELECT 'Coca Cola 2L', 'Refresco de cola, botella de 2 litros', 2.80, 150, 'TU_USER_UID_AQUI', 'bebidas'
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE user_uid = 'TU_USER_UID_AQUI' AND name = 'Coca Cola 2L'
);

INSERT INTO products (name, description, price, in_stock, user_uid, category) 
SELECT 'Pan Integral', 'Pan integral fresco', 1.80, 20, 'TU_USER_UID_AQUI', 'comestibles'
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE user_uid = 'TU_USER_UID_AQUI' AND name = 'Pan Integral'
);

INSERT INTO products (name, description, price, in_stock, user_uid, category) 
SELECT 'Detergente Líquido', 'Detergente líquido para ropa', 4.50, 15, 'TU_USER_UID_AQUI', 'limpieza'
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE user_uid = 'TU_USER_UID_AQUI' AND name = 'Detergente Líquido'
);

INSERT INTO products (name, description, price, in_stock, user_uid, category) 
SELECT 'Champú 400ml', 'Champú para todo tipo de cabello', 6.75, 25, 'TU_USER_UID_AQUI', 'higiene'
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE user_uid = 'TU_USER_UID_AQUI' AND name = 'Champú 400ml'
);

-- Si no hay clientes, insertar uno genérico
INSERT INTO customers (name, email, phone, user_uid, status) 
SELECT 'Cliente General', 'cliente@general.com', '555-0001', 'TU_USER_UID_AQUI', 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM customers WHERE user_uid = 'TU_USER_UID_AQUI' AND name = 'Cliente General'
);

-- Verificar que los datos se insertaron correctamente
-- SELECT * FROM products WHERE user_uid = 'TU_USER_UID_AQUI';
-- SELECT * FROM customers WHERE user_uid = 'TU_USER_UID_AQUI';