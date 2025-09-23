import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reports/orders-by-day?date=YYYY-MM-DD
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  if (!date) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 })
  }

  const day = new Date(date)
  const fromISO = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0)).toISOString()
  const toISO = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1, 0, 0, 0)).toISOString()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      is_credit_sale,
      status,
      created_at,
      customer:customer_id ( name )
    `)
    .eq('user_uid', user.id)
    .gte('created_at', fromISO)
    .lt('created_at', toISO)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders-by-day:', error)
    return NextResponse.json({ error: 'Failed to fetch orders by day' }, { status: 500 })
  }

  return NextResponse.json({ orders: data || [] })
}
