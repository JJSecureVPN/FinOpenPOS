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

  try {
    // Verificar si el usuario es admin usando la función SQL
    const { data: userRole, error: roleError } = await supabase
      .rpc('get_user_role');
    
    if (roleError || userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { role } = await request.json();

    if (!role || !['admin', 'cajero'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required (admin or cajero)' }, { status: 400 });
    }

    // Actualizar el rol usando función SQL
    const { data: result, error } = await supabase
      .rpc('update_user_role_admin', {
        target_user_id: params.id,
        new_role: role
      });

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(result);
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

  try {
    // Verificar si el usuario es admin usando la función SQL
    const { data: userRole, error: roleError } = await supabase
      .rpc('get_user_role');
    
    if (roleError || userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Eliminar usuario usando función SQL
    const { data: result, error } = await supabase
      .rpc('delete_user_admin', {
        target_user_id: params.id
      });

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in delete user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}