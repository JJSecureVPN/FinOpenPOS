import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_uid', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const rawBody = await request.json();
    // Evitamos usar un id manual (Date.now() produce valores > int4). Dejamos que SERIAL lo genere.
    // Normalizamos amount y type.
    const { id: _ignoreId, amount, type, ...rest } = rawBody || {};
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const insertPayload = {
      ...rest,
      amount: parsedAmount,
      type,
      user_uid: user.id,
      status: rest.status || 'completed'
    };

  // Aseguramos que las nuevas transacciones tengan status 'completed' para que sean consideradas
  // en las métricas de ingresos, gastos y ganancia.
    const { data, error } = await supabase
      .from('transactions')
      .insert([ insertPayload ])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
