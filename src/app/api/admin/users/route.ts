import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
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

    // En lugar de auth.admin, vamos a usar la función SQL directamente
    const { data: users, error } = await supabase
      .rpc('get_all_users_admin');

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users: ' + error.message }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    // Por ahora, retornamos un mensaje indicando que los usuarios se crean manualmente
    return NextResponse.json({ 
      message: 'Para crear usuarios, ve a Supabase Dashboard → Authentication → Users → Invite User. Luego puedes cambiar el rol aquí.',
      instructions: [
        '1. Ve a Supabase Dashboard',
        '2. Authentication → Users',
        '3. Haz clic en "Invite User"',
        '4. Ingresa el email del nuevo cajero',
        '5. El usuario recibirá un email de invitación',
        '6. Después puedes cambiar su rol en esta pantalla'
      ]
    });
  } catch (error) {
    console.error('Error in create user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}