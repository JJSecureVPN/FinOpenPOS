import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar si el usuario actual es admin usando la función SQL
  const { data: isAdminResult, error: roleError } = await supabase
    .rpc('is_admin');
  
  if (roleError || !isAdminResult) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const { role } = await request.json();

    if (!role || !['admin', 'cajero'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required (admin or cajero)' }, { status: 400 });
    }

    // Actualizar el rol del usuario
    const { data, error } = await supabase.auth.admin.updateUserById(params.id, {
      user_metadata: { role }
    });

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'cajero',
      updated_at: data.user.updated_at
    });
  } catch (error) {
    console.error('Error in update user role API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar si el usuario actual es admin usando la función SQL
  const { data: isAdminResult, error: roleError } = await supabase
    .rpc('is_admin');
  
  if (roleError || !isAdminResult) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // No permitir que el admin se elimine a sí mismo
  if (user.id === params.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    // Eliminar el usuario
    const { error } = await supabase.auth.admin.deleteUser(params.id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in delete user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}