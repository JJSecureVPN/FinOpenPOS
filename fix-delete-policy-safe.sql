-- ========================================
-- SCRIPT SEGURO - SOLO AGREGAR POLÍTICA DELETE FALTANTE
-- Este script NO elimina datos existentes
-- ========================================

-- Solo agregar la política DELETE que falta para transactions
-- Primero eliminar si existe, luego crear nueva
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" 
ON transactions 
FOR DELETE 
USING (user_uid = auth.uid()::text);

-- Verificar que todas las políticas de transactions están presentes
SELECT 
    policyname, 
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ Leer transacciones'
        WHEN cmd = 'INSERT' THEN '✅ Crear transacciones' 
        WHEN cmd = 'UPDATE' THEN '✅ Editar transacciones'
        WHEN cmd = 'DELETE' THEN '✅ Eliminar transacciones'
        ELSE cmd
    END as descripcion
FROM pg_policies 
WHERE tablename = 'transactions'
ORDER BY cmd;

-- Mensaje de confirmación
SELECT '✅ Política DELETE agregada correctamente. Ahora puedes eliminar transacciones.' as resultado;