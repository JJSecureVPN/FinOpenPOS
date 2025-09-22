import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Obtener el rol usando la función SQL que creamos
    const { data: roleData, error } = await supabase
      .rpc('get_user_role');

    if (error) {
      console.error('Error getting user role:', error);
      return NextResponse.json({ 
        user_id: user.id,
        email: user.email,
        role: 'cajero' 
      });
    }

    return NextResponse.json({ 
      user_id: user.id,
      email: user.email,
      role: roleData || 'cajero' 
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}