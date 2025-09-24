import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reports/sales-by-day?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  // Rango por defecto: últimos 30 días
  const toDate = to ? new Date(to) : new Date()
  const fromDate = from ? new Date(from) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)

  // Normalizar a límites del día
  const fromISO = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate(), 0, 0, 0)).toISOString()
  const toEnd = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate() + 1, 0, 0, 0))
  const toISO = toEnd.toISOString()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id,total_amount,is_credit_sale,created_at')
    .eq('user_uid', user.id)
    .gte('created_at', fromISO)
    .lt('created_at', toISO)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders for sales-by-day:', error)
    return NextResponse.json({ error: 'Failed to fetch sales by day' }, { status: 500 })
  }

  const byDay = (orders || []).reduce((acc: Record<string, any>, o: any) => {
    const day = new Date(o.created_at).toISOString().split('T')[0]
    if (!acc[day]) {
      acc[day] = {
        date: day,
        totalAmount: 0,
        totalOrders: 0,
        cashAmount: 0,
        cashOrders: 0,
        creditAmount: 0,
        creditOrders: 0,
      }
    }
    acc[day].totalAmount += Number(o.total_amount) || 0
    acc[day].totalOrders += 1
    if (o.is_credit_sale) {
      acc[day].creditAmount += Number(o.total_amount) || 0
      acc[day].creditOrders += 1
    } else {
      acc[day].cashAmount += Number(o.total_amount) || 0
      acc[day].cashOrders += 1
    }
    return acc
  }, {})

  const summary = Object.values(byDay).sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
  return NextResponse.json({ summary })
}
