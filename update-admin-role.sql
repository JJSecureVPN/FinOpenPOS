-- Actualizar el rol admin en user_metadata para que funcione con las APIs
-- EJECUTA ESTE SCRIPT EN SUPABASE SQL EDITOR

UPDATE auth.users 
SET user_metadata = 
  COALESCE(user_metadata, '{}'::jsonb) || 
  jsonb_build_object('role', 'admin')
WHERE email = 'jazmincardozoh05@gmail.com';

-- Verificar que funcionó
SELECT id, email, user_metadata->>'role' as role_in_metadata, raw_user_meta_data->>'role' as role_in_raw
FROM auth.users 
WHERE email = 'jazmincardozoh05@gmail.com';