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
    .select('id, description, type, category, amount, created_at')
    .eq('user_uid', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  // Adaptamos el payload a la forma que espera el front-end (propiedad date)
  const mapped = (data || []).map((t: any) => ({
    id: t.id,
    description: t.description ?? '',
    type: t.type,
    category: t.category ?? '',
    amount: typeof t.amount === 'number' ? t.amount : Number(t.amount),
    date: t.created_at
  }));

  return NextResponse.json(mapped)
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
    // Eliminamos campos que no pertenecen a la tabla (p.ej. date, id)
    const { id: _ignoreId, date: _ignoreDate, amount, type, ...rest } = rawBody || {};
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
    const { data: inserted, error: insertError } = await supabase
      .from('transactions')
      .insert([ insertPayload ])
    .select()
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const row = inserted?.[0];
  if (!row) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  // Normalizamos respuesta para UI
  const response = {
    id: row.id,
    description: row.description ?? '',
    type: row.type,
    category: row.category ?? '',
    amount: typeof row.amount === 'number' ? row.amount : Number(row.amount),
    date: row.created_at
  };

  return NextResponse.json(response)
}
