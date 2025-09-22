-- Agregar columna de deuda a la tabla customers
ALTER TABLE customers 
ADD COLUMN debt DECIMAL(10, 2) DEFAULT 0.00;

-- Modificar la tabla transactions para incluir el tipo de pago al fiado
-- Agregar nueva categoría para ventas al fiado
-- Las ventas al fiado no cuentan como income hasta que se pagan

-- Crear tabla para pagos de deuda
CREATE TABLE debt_payments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    amount DECIMAL(10, 2) NOT NULL,
    order_ids INTEGER[], -- Array de IDs de órdenes que se están pagando
    user_uid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Actualizar tabla orders para incluir si es al fiado
ALTER TABLE orders 
ADD COLUMN is_credit_sale BOOLEAN DEFAULT FALSE;

-- Comentarios para entender el flujo:
-- 1. Venta al fiado: is_credit_sale = TRUE, customer_id requerido, NO se crea transaction de income
-- 2. Pago de deuda: se crea debt_payment y transaction de income por el monto pagado
-- 3. Dinero fiado total = SUM(orders.total_amount WHERE is_credit_sale = TRUE AND paid = FALSE)