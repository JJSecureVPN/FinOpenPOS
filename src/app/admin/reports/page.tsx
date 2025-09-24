"use client";

import React, { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveLayout, ResponsiveCard } from '@/components/responsive'
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
        <ResponsiveLayout className="w-full" direction="col" gap="md">
          <div>
            <Typography variant="h1">Reportes</Typography>
            <Typography variant="body" className="text-muted-foreground">Ventas por día y movimientos</Typography>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <div className="flex items-center gap-2 w-full">
              <Typography variant="body-sm">Desde</Typography>
              <Input className="flex-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 w-full">
              <Typography variant="body-sm">Hasta</Typography>
              <Input className="flex-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </ResponsiveLayout>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">Ventas por día</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-4 space-y-4">
            <ResponsiveGrid autoFit minItemWidth="220px" gap="md">
              <ResponsiveCard
                title="Ventas Totales"
                headerActions={<span className="text-lg font-semibold">${totals.total.toFixed(2)}</span>}
              >
                <Typography variant="body-sm" className="text-muted-foreground">Pedidos: {totals.orders}</Typography>
              </ResponsiveCard>
              <ResponsiveCard
                title="Contado"
                headerActions={<span className="text-lg font-semibold">${totals.cash.toFixed(2)}</span>}
              >
                <Typography variant="body-sm" className="text-muted-foreground">Ventas cobradas</Typography>
              </ResponsiveCard>
              <ResponsiveCard
                title="Fiado"
                headerActions={<span className="text-lg font-semibold text-orange-600">${totals.credit.toFixed(2)}</span>}
              >
                <Typography variant="body-sm" className="text-muted-foreground">Ventas a crédito</Typography>
              </ResponsiveCard>
            </ResponsiveGrid>
            {/* Vista móvil: lista compacta de días */}
            <div className="sm:hidden">
              <Card>
                <CardContent className="p-0">
                  {salesLoading ? (
                    <div className="p-4">Cargando...</div>
                  ) : sales.length === 0 ? (
                    <div className="p-4">Sin datos</div>
                  ) : (
                    <ul className="divide-y">
                      {sales.map((d) => (
                        <li key={d.date}>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between p-4 text-left"
                            onClick={() => toggleDay(d.date)}
                          >
                            <div className="flex items-start gap-2">
                              {expanded[d.date] ? <ChevronDown className="w-4 h-4 mt-1" /> : <ChevronRight className="w-4 h-4 mt-1" />}
                              <div>
                                <div className="font-medium">{new Date(d.date).toLocaleDateString()}</div>
                                <div className="text-xs text-muted-foreground">{d.totalOrders} pedidos · Contado ${d.cashAmount.toFixed(0)} · Fiado ${d.creditAmount.toFixed(0)}</div>
                              </div>
                            </div>
                            <div className="text-right font-semibold">${d.totalAmount.toFixed(2)}</div>
                          </button>
                          {expanded[d.date] && (
                            <div className="px-4 pb-4">
                              <Typography variant="h3" className="mb-2">Ventas del día</Typography>
                              <ResponsiveGrid autoFit minItemWidth="min(300px, 100%)" gap="md">
                                {(dayDetails[d.date]?.orders || []).map((o: any) => (
                                  <ResponsiveCard
                                    key={o.id}
                                    title={`Venta #${o.id}`}
                                    description={`${new Date(o.created_at).toLocaleTimeString()} • ${o.is_credit_sale ? 'Fiado' : 'Contado'}`}
                                    headerActions={<span className="font-semibold">${Number(o.total_amount || 0).toFixed(2)}</span>}
                                  >
                                    <div className="space-y-2">
                                      <div className="text-sm text-muted-foreground">
                                        Cliente: <span className="text-foreground">{o.customer?.name || '-'}</span>
                                      </div>
                                      {(o.items || []).length === 0 ? (
                                        <div className="text-sm text-muted-foreground">Sin productos</div>
                                      ) : (
                                        <div className="space-y-2">
                                          {o.items.map((it: any) => (
                                            <div key={it.id} className="flex items-center justify-between border-b border-border/60 pb-1">
                                              <span className="text-sm">{it.product?.name || 'Producto'}</span>
                                              <span className="text-sm text-muted-foreground">x{it.quantity} — ${Number(it.price).toFixed(2)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </ResponsiveCard>
                                ))}
                                {(!dayDetails[d.date]?.orders || dayDetails[d.date]?.orders.length === 0) && (
                                  <ResponsiveCard title="Sin ventas">
                                    <Typography variant="body-sm" className="text-muted-foreground">No hay ventas registradas para este día.</Typography>
                                  </ResponsiveCard>
                                )}
                              </ResponsiveGrid>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Vista de escritorio/tablet: tabla */}
            <Card className="hidden sm:block">
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                <Table className="min-w-[560px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Pedidos</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Contado</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Fiado</TableHead>
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
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {expanded[d.date] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                <div className="flex flex-col">
                                  <span>{new Date(d.date).toLocaleDateString()}</span>
                                  <span className="sm:hidden text-xs text-muted-foreground">{d.totalOrders} pedidos · Contado ${d.cashAmount.toFixed(0)} · Fiado ${d.creditAmount.toFixed(0)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right hidden sm:table-cell">{d.totalOrders}</TableCell>
                            <TableCell className="text-right hidden sm:table-cell">${d.cashAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right hidden sm:table-cell">${d.creditAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${d.totalAmount.toFixed(2)}</TableCell>
                          </TableRow>
                          {expanded[d.date] && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-muted/20 p-0">
                                <div className="p-4">
                                  <Typography variant="h3" className="mb-3">Ventas del día</Typography>
                                  <ResponsiveGrid autoFit minItemWidth="min(300px, 100%)" gap="md">
                                    {(dayDetails[d.date]?.orders || []).map((o: any) => (
                                      <ResponsiveCard
                                        key={o.id}
                                        title={`Venta #${o.id}`}
                                        description={`${new Date(o.created_at).toLocaleTimeString()} • ${o.is_credit_sale ? 'Fiado' : 'Contado'}`}
                                        headerActions={<span className="font-semibold">${Number(o.total_amount || 0).toFixed(2)}</span>}
                                        fullHeight
                                      >
                                        <div className="space-y-2">
                                          <div className="text-sm text-muted-foreground">
                                            Cliente: <span className="text-foreground">{o.customer?.name || '-'}</span>
                                          </div>
                                          {(o.items || []).length === 0 ? (
                                            <div className="text-sm text-muted-foreground">Sin productos</div>
                                          ) : (
                                            <>
                                              {/* Lista compacta para móvil */}
                                              <div className="sm:hidden space-y-2">
                                                {o.items.map((it: any) => (
                                                  <div key={it.id} className="flex items-center justify-between border-b border-border/60 pb-1">
                                                    <span className="text-sm">{it.product?.name || 'Producto'}</span>
                                                    <span className="text-sm text-muted-foreground">x{it.quantity} — ${Number(it.price).toFixed(2)}</span>
                                                  </div>
                                                ))}
                                              </div>
                                              {/* Tabla para pantallas medianas en adelante */}
                                              <div className="hidden sm:block overflow-x-auto rounded-md border">
                                                <Table className="min-w-[360px] sm:min-w-0">
                                                  <TableHeader>
                                                    <TableRow>
                                                      <TableHead>Producto</TableHead>
                                                      <TableHead className="w-16 text-right">Cant.</TableHead>
                                                      <TableHead className="w-24 sm:w-28 text-right">Precio</TableHead>
                                                    </TableRow>
                                                  </TableHeader>
                                                  <TableBody>
                                                    {o.items.map((it: any) => (
                                                      <TableRow key={it.id}>
                                                        <TableCell>{it.product?.name || 'Producto'}</TableCell>
                                                        <TableCell className="text-right">{it.quantity}</TableCell>
                                                        <TableCell className="text-right">${Number(it.price).toFixed(2)}</TableCell>
                                                      </TableRow>
                                                    ))}
                                                  </TableBody>
                                                </Table>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </ResponsiveCard>
                                    ))}
                                    {(!dayDetails[d.date]?.orders || dayDetails[d.date]?.orders.length === 0) && (
                                      <ResponsiveCard title="Sin ventas">
                                        <Typography variant="body-sm" className="text-muted-foreground">No hay ventas registradas para este día.</Typography>
                                      </ResponsiveCard>
                                    )}
                                  </ResponsiveGrid>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
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
                <div className="w-full overflow-x-auto">
                <Table className="min-w-[560px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="hidden sm:table-cell">Descripción</TableHead>
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
                          <TableCell className="hidden sm:table-cell">{m.description}</TableCell>
                          <TableCell className="text-right">${m.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  )
}
