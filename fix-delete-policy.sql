-- Agregar política DELETE faltante para transactions
-- EJECUTA ESTE SCRIPT EN SUPABASE SQL EDITOR

CREATE POLICY "Users can delete own transactions" 
ON transactions 
FOR DELETE 
USING (user_uid = auth.uid()::text);

-- Verificar que la política se creó correctamente
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'transactions'
ORDER BY policyname;