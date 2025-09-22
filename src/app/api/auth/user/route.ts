import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Obtener el rol del usuario actual
    const { data: userData } = await supabase.auth.admin.getUserById(user.id);
    const userRole = userData?.user?.user_metadata?.role || 'cajero';

    return NextResponse.json({ 
      user_id: user.id,
      email: user.email,
      role: userRole 
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}