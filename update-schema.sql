-- Modificar la tabla orders para permitir customer_id como NULL
-- Esto permite ventas sin cliente (para ventas normales en efectivo)

ALTER TABLE orders 
ALTER COLUMN customer_id DROP NOT NULL;

-- Nota: En el editor SQL de Supabase no se admite el comando psql "\d".
-- Para verificar, puedes ejecutar por ejemplo:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'orders';