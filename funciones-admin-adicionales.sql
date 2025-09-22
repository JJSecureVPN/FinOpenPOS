-- Funciones adicionales para gestión de usuarios sin auth.admin
-- EJECUTA ESTE SCRIPT EN SUPABASE SQL EDITOR DESPUÉS DEL SCRIPT PRINCIPAL

-- Función para obtener todos los usuarios (solo para admins)
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
) AS $$
BEGIN
  -- Verificar que quien llama es admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Retornar usuarios con sus roles
  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,
    COALESCE(u.raw_user_meta_data->>'role', 'cajero')::text as role,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear usuarios (solo para admins)
CREATE OR REPLACE FUNCTION public.create_user_admin(
  user_email text,
  user_password text,
  user_role text DEFAULT 'cajero'
)
RETURNS JSON AS $$
DECLARE
  new_user_id uuid;
  result JSON;
BEGIN
  -- Verificar que quien llama es admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Validar rol
  IF user_role NOT IN ('admin', 'cajero') THEN
    RAISE EXCEPTION 'Invalid role: must be admin or cajero';
  END IF;
  
  -- Por ahora, solo retornamos un placeholder ya que crear usuarios requiere auth.admin
  -- En producción, esto se haría mediante webhook o función externa
  RAISE EXCEPTION 'User creation requires manual setup. Please create user in Supabase Dashboard and then update role.';
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar rol de usuario (solo para admins)
CREATE OR REPLACE FUNCTION public.update_user_role_admin(
  target_user_id uuid,
  new_role text
)
RETURNS JSON AS $$
BEGIN
  -- Verificar que quien llama es admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Validar rol
  IF new_role NOT IN ('admin', 'cajero') THEN
    RAISE EXCEPTION 'Invalid role: must be admin or cajero';
  END IF;
  
  -- Actualizar el rol en raw_user_meta_data
  UPDATE auth.users 
  SET 
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', new_role),
    user_metadata = COALESCE(user_metadata, '{}'::jsonb) || jsonb_build_object('role', new_role),
    updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Verificar que se actualizó
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN json_build_object(
    'id', target_user_id,
    'role', new_role,
    'updated_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para eliminar usuario (solo para admins) 
CREATE OR REPLACE FUNCTION public.delete_user_admin(
  target_user_id uuid
)
RETURNS JSON AS $$
BEGIN
  -- Verificar que quien llama es admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- No permitir que se elimine a sí mismo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  -- Por ahora, solo desactivar el usuario marcándolo como inactivo
  -- En producción, esto requeriría auth.admin
  UPDATE auth.users 
  SET 
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('status', 'inactive'),
    user_metadata = COALESCE(user_metadata, '{}'::jsonb) || jsonb_build_object('status', 'inactive')
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN json_build_object(
    'message', 'User marked as inactive',
    'user_id', target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;