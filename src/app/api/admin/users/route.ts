import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar si el usuario es admin usando auth.admin.getUserById
  try {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
    
    if (userError) {
      console.error('Error getting user data:', userError);
      return NextResponse.json({ error: 'Unable to verify user' }, { status: 500 });
    }

    const userRole = userData?.user?.user_metadata?.role || 'cajero';
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Obtener todos los usuarios (solo admins pueden ver esto)
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Formatear la respuesta con información relevante
    const formattedUsers = users.users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role || 'cajero',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at
    }));

    return NextResponse.json(formattedUsers);
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

  // Verificar si el usuario es admin usando auth.admin.getUserById
  try {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
    
    if (userError) {
      console.error('Error getting user data:', userError);
      return NextResponse.json({ error: 'Unable to verify user' }, { status: 500 });
    }

    const userRole = userData?.user?.user_metadata?.role || 'cajero';
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { email, password, role = 'cajero' } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Crear el nuevo usuario con user_metadata
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
      email_confirm: true
    });

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: newUser.user.id,
      email: newUser.user.email,
      role: newUser.user.user_metadata?.role || 'cajero',
      created_at: newUser.user.created_at
    });
  } catch (error) {
    console.error('Error in create user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}