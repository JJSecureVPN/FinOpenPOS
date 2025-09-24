"use client";

import React, { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, ResponsiveGrid } from '@/components/responsive'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight, Filter } from 'lucide-react'

type SalesDay = {
  date: string
  totalAmount: number
  totalOrders: number
  cashAmount: number
  cashOrders: number
  creditAmount: number
  creditOrders: number
}

type Movement = {
  id: number
  description: string
  type: 'income' | 'expense'
  category: string | null
  amount: number
  created_at: string
}

export default function ReportsPage() {
  const [from, setFrom] = useState<string>(() => new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10))

  // Sales by day state
  const [salesLoading, setSalesLoading] = useState(false)
  const [sales, setSales] = useState<SalesDay[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [dayDetails, setDayDetails] = useState<Record<string, { orders: any[] }>>({})

  // Movements state
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [movements, setMovements] = useState<Movement[]>([])
  const [typeFilter, setTypeFilter] = useState<'all'|'income'|'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    const fetchSales = async () => {
      setSalesLoading(true)
      try {
        const res = await fetch(`/api/reports/sales-by-day?from=${from}&to=${to}`)
        if (res.ok) {
          const json = await res.json()
          setSales(json.summary || [])
        }
      } finally {
        setSalesLoading(false)
      }
    }
    const fetchMovements = async () => {
      setMovementsLoading(true)
      try {
        const params = new URLSearchParams({ from, to, type: typeFilter, category: categoryFilter })
        const res = await fetch(`/api/reports/movements?${params.toString()}`)
        if (res.ok) {
          const json = await res.json()
          setMovements(json.items || [])
        }
      } finally {
        setMovementsLoading(false)
      }
    }
    fetchSales()
    fetchMovements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, typeFilter, categoryFilter])

  const totals = useMemo(() => {
    return sales.reduce((acc, d) => {
      acc.total += d.totalAmount
      acc.cash += d.cashAmount
      acc.credit += d.creditAmount
      acc.orders += d.totalOrders
      return acc
    }, { total: 0, cash: 0, credit: 0, orders: 0 })
  }, [sales])

  const toggleDay = async (date: string) => {
    setExpanded(prev => ({ ...prev, [date]: !prev[date] }))
    if (!dayDetails[date]) {
      // cargar solo las órdenes del día
      const ordRes = await fetch(`/api/reports/orders-by-day?date=${date}`)
      const ordJson = ordRes.ok ? await ordRes.json() : { orders: [] }
      setDayDetails(prev => ({ ...prev, [date]: { orders: ordJson.orders || [] } }))
    }
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Typography variant="h1">Reportes</Typography>
            <Typography variant="body" className="text-muted-foreground">Ventas por día y movimientos</Typography>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Typography variant="body-sm">Desde</Typography>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Typography variant="body-sm">Hasta</Typography>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">Ventas por día</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-4 space-y-4">
            <ResponsiveGrid cols={{ default: 1, md: 3 }} gap="md">
              <Card>
                <CardHeader><CardTitle>Ventas Totales</CardTitle></CardHeader>
                <CardContent>
                  <Typography variant="h2" weight="bold">${totals.total.toFixed(2)}</Typography>
                  <Typography variant="body-sm" className="text-muted-foreground">Pedidos: {totals.orders}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Contado</CardTitle></CardHeader>
                <CardContent>
                  <Typography variant="h2" weight="bold">${totals.cash.toFixed(2)}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Fiado</CardTitle></CardHeader>
                <CardContent>
                  <Typography variant="h2" weight="bold" className="text-orange-600">${totals.credit.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right">Contado</TableHead>
                      <TableHead className="text-right">Fiado</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesLoading ? (
                      <TableRow><TableCell colSpan={5} className="p-6">Cargando...</TableCell></TableRow>
                    ) : sales.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="p-6">Sin datos</TableCell></TableRow>
                    ) : (
                      sales.map((d) => (
                        <React.Fragment key={d.date}>
                          <TableRow className="cursor-pointer hover:bg-muted/40" onClick={() => toggleDay(d.date)}>
                            <TableCell className="flex items-center gap-2">
                              {expanded[d.date] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              {new Date(d.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">{d.totalOrders}</TableCell>
                            <TableCell className="text-right">${d.cashAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${d.creditAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${d.totalAmount.toFixed(2)}</TableCell>
                          </TableRow>
                          {expanded[d.date] && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-muted/20 p-0">
                                <div className="p-4">
                                  <Card>
                                    <CardHeader><CardTitle>Ventas del día</CardTitle></CardHeader>
                                    <CardContent className="p-0">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Hora</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Productos</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {(dayDetails[d.date]?.orders || []).map((o: any) => (
                                            <React.Fragment key={o.id}>
                                              <TableRow>
                                                <TableCell>{new Date(o.created_at).toLocaleTimeString()}</TableCell>
                                                <TableCell>{o.customer?.name || '-'}</TableCell>
                                                <TableCell>{o.is_credit_sale ? 'Fiado' : 'Contado'}</TableCell>
                                                <TableCell>
                                                  {(o.items || []).length === 0 ? (
                                                    <span className="text-muted-foreground">-</span>
                                                  ) : (
                                                    <ul className="list-disc pl-5 space-y-1">
                                                      {o.items.map((it: any) => (
                                                        <li key={it.id}>
                                                          {it.product?.name || 'Producto'} x{it.quantity} @ ${Number(it.price).toFixed(2)}
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  )}
                                                </TableCell>
                                                <TableCell className="text-right">${Number(o.total_amount || 0).toFixed(2)}</TableCell>
                                              </TableRow>
                                            </React.Fragment>
                                          ))}
                                          {(!dayDetails[d.date]?.orders || dayDetails[d.date]?.orders.length === 0) && (
                                            <TableRow><TableCell colSpan={5} className="p-3 text-muted-foreground">Sin ventas</TableCell></TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex gap-2 items-center">
                    <label className="text-sm">Tipo</label>
                    <select className="border rounded px-2 py-1 h-9" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
                      <option value="all">Todos</option>
                      <option value="income">Ingresos</option>
                      <option value="expense">Gastos</option>
                    </select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="text-sm">Categoría</label>
                    <Input placeholder="all o nombre exacto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value || 'all')} />
                  </div>
                  <div className="flex-1" />
                  <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" />Filtrar</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementsLoading ? (
                      <TableRow><TableCell colSpan={5} className="p-6">Cargando...</TableCell></TableRow>
                    ) : movements.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="p-6">Sin movimientos</TableCell></TableRow>
                    ) : (
                      movements.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                          <TableCell>{m.type === 'income' ? 'Ingreso' : 'Gasto'}</TableCell>
                          <TableCell>{m.category || '-'}</TableCell>
                          <TableCell>{m.description}</TableCell>
                          <TableCell className="text-right">${m.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  )
}
