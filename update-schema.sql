-- Modificar la tabla orders para permitir customer_id como NULL
-- Esto permite ventas sin cliente (para ventas normales en efectivo)

ALTER TABLE orders 
ALTER COLUMN customer_id DROP NOT NULL;

-- Verificar que la modificación se aplicó correctamente
\d orders;