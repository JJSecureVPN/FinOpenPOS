import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { transactionId: string } }
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawBody = await request.json();
  const transactionId = params.transactionId;
  const { id: _ignoreId, amount, type, status, ...rest } = rawBody || {};
  const parsedAmount = Number(amount);
  if (!isNaN(parsedAmount) && parsedAmount < 0) {
    // Permitimos negativos? Actualmente no; se podría permitir para ajustes. Por ahora validar > 0
  }
  const updatePayload: any = {
    ...rest,
    user_uid: user.id,
    status: status || 'completed'
  };
  if (!isNaN(parsedAmount)) updatePayload.amount = parsedAmount;
  if (type === 'income' || type === 'expense') updatePayload.type = type;

  const { data, error } = await supabase
    .from('transactions')
    .update(updatePayload)
    .eq('id', transactionId)
    .eq('user_uid', user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data.length === 0) {
    return NextResponse.json({ error: 'Transaction not found or not authorized' }, { status: 404 })
  }

  return NextResponse.json(data[0])
}

export async function DELETE(
  request: Request,
  { params }: { params: { transactionId: string } }
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transactionId = params.transactionId;

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_uid', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Transaction deleted successfully' })
}
