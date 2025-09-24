import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/reports/debt-payments?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = searchParams.get('to') || new Date().toISOString().slice(0, 10);

  try {
    let query = supabase
      .from('debt_payments')
      .select(`
        id,
        customer_id,
        amount,
        description,
        created_at,
        customer:customer_id ( id, name )
      `)
      .eq('user_uid', user.id)
      .gte('created_at', `${from}T00:00:00.000Z`)
      .lte('created_at', `${to}T23:59:59.999Z`)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    const items = (data || []).map((p: any) => ({
      id: p.id,
      customerId: p.customer_id,
      customerName: p.customer?.name || null,
      amount: Number(p.amount) || 0,
      description: p.description || '',
      created_at: p.created_at,
    }));

    const totalAmount = items.reduce((sum, it) => sum + (it.amount || 0), 0);

    return NextResponse.json({ from, to, totalAmount, count: items.length, items });
  } catch (error) {
    console.error('Error fetching debt payments:', error);
    return NextResponse.json({ error: 'Failed to fetch debt payments' }, { status: 500 });
  }
}
