import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Nota:
// Antes se calculaba la ganancia sólo tomando transactions con category === 'selling' (o 'Pago de Deuda').
// Como el formulario permite categorías libres ("Ventas", "Venta", etc.) la condición nunca coincidía
// y devolvía 0. Ahora usamos simplemente: totalProfit = ingresos (type === 'income') - gastos (type === 'expense').
// Si deseas volver a distinguir sólo ventas reales, habría que normalizar categorías en la inserción.

export async function GET(_request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Obtenemos únicamente los campos necesarios filtrando por usuario y status
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('status', 'completed')
    .eq('user_uid', user.id);

  if (transactionsError) {
    console.error('Error fetching transactions (profit total):', transactionsError);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }

  const incomeTotal = (transactionsData || [])
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const expenseTotal = (transactionsData || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalProfit = incomeTotal - expenseTotal;

  return NextResponse.json({ totalProfit });
}
