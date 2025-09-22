import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Obtener el total de deudas pendientes de todos los clientes
    const { data, error } = await supabase
      .from('customers')
      .select('debt')
      .eq('user_uid', user.id);

    if (error) {
      throw error;
    }

    // Sumar todas las deudas actuales de los clientes
    const totalCreditSales = data.reduce((sum, customer) => sum + (customer.debt || 0), 0);

    return NextResponse.json({ 
      totalCreditSales: totalCreditSales || 0 
    });
  } catch (error) {
    console.error('Error fetching credit sales:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch credit sales',
      totalCreditSales: 0 
    }, { status: 500 });
  }
}