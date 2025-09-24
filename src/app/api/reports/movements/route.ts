import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reports/movements?type=income|expense|all&category=<cat|all>&from=YYYY-MM-DD&to=YYYY-MM-DD
// Nota: Este endpoint EXCLUYE las ventas registradas (categoría 'Ventas') porque las ventas
// se reportan por separado en "Ventas por día".
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const type = (url.searchParams.get('type') || 'all') as 'income' | 'expense' | 'all'
  const category = url.searchParams.get('category') || 'all'
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  const toDate = to ? new Date(to) : new Date()
  const fromDate = from ? new Date(from) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
  const fromISO = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate(), 0, 0, 0)).toISOString()
  const toEnd = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate() + 1, 0, 0, 0))
  const toISO = toEnd.toISOString()

  let query = supabase
    .from('transactions')
    .select('id, description, type, category, amount, status, created_at')
    .eq('user_uid', user.id)
    .eq('status', 'completed')
    // Excluir ventas: no queremos mostrar pagos de órdenes aquí
    .neq('category', 'Ventas')
    // Refuerzo: cualquier transacción ligada a una orden (order_id) se considera venta
    .is('order_id', null)
    .gte('created_at', fromISO)
    .lt('created_at', toISO)
    .order('created_at', { ascending: false })

  if (type !== 'all') {
    query = query.eq('type', type)
  }
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching movements:', error)
    return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 })
  }

  // Agrupar por día para quick summary
  const byDay = (data || []).reduce((acc: Record<string, { date: string; income: number; expense: number; count: number }>, t: any) => {
    const day = new Date(t.created_at).toISOString().split('T')[0]
    if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0, count: 0 }
    if (t.type === 'income') acc[day].income += Number(t.amount) || 0
    if (t.type === 'expense') acc[day].expense += Number(t.amount) || 0
    acc[day].count += 1
    return acc
  }, {})

  const summary = Object.values(byDay).sort((a, b) => (a.date < b.date ? 1 : -1))
  return NextResponse.json({ items: data || [], summary })
}
