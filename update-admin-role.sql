-- Actualizar el rol admin en raw_user_meta_data para que funcione con las APIs
-- EJECUTA ESTE SCRIPT EN SUPABASE SQL EDITOR

-- Primero verificar qué columnas existen en auth.users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
AND column_name LIKE '%meta%'
ORDER BY column_name;

-- Actualizar el rol en raw_user_meta_data (que sí existe)
UPDATE auth.users 
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'admin')
WHERE email = 'jazmincardozoh05@gmail.com';

-- Verificar que funcionó
SELECT id, email, raw_user_meta_data->>'role' as role_in_raw
FROM auth.users 
WHERE email = 'jazmincardozoh05@gmail.com';