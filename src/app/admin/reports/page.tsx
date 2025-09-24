"use client";

import React, { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveLayout, ResponsiveCard } from '@/components/responsive'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'

type SalesDay = {
  date: string
  totalAmount: number
  totalOrders: number
  cashAmount: number
  cashOrders: number
  creditAmount: number
  creditOrders: number
}

type DebtPayment = {
  id: number
  customerId: number
  customerName: string | null
  amount: number
  created_at: string
  description?: string
}

export default function ReportsPage() {
  const [from, setFrom] = useState<string>(() => new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10))

  const fromDate = useMemo(() => (from ? new Date(from) : undefined), [from])
  const toDate = useMemo(() => (to ? new Date(to) : undefined), [to])
  const formatDay = (d?: Date) => (d ? d.toLocaleDateString('es-ES') : 'Seleccionar')
  const yearNow = useMemo(() => new Date().getFullYear(), [])
  const handleSelectFrom = (d?: Date) => {
    if (!d) return
    const iso = new Date(d).toISOString().slice(0,10)
    setFrom(iso)
    if (to && new Date(iso) > new Date(to)) {
      setTo(iso)
    }
  }
  const handleSelectTo = (d?: Date) => {
    if (!d) return
    const iso = new Date(d).toISOString().slice(0,10)
    setTo(iso)
    if (from && new Date(iso) < new Date(from)) {
      setFrom(iso)
    }
  }

  // Helpers para presets
  const setToday = () => {
    const today = new Date()
    setFrom(today.toISOString().slice(0,10))
    setTo(today.toISOString().slice(0,10))
  }
  const setLast7Days = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 6)
    setFrom(start.toISOString().slice(0,10))
    setTo(end.toISOString().slice(0,10))
  }
  const setThisWeek = () => {
    const end = new Date()
    const dow = (end.getDay() + 6) % 7 // Lunes=0
    const start = new Date(end)
    start.setDate(end.getDate() - dow)
    setFrom(start.toISOString().slice(0,10))
    setTo(end.toISOString().slice(0,10))
  }
  const setThisMonth = () => {
    const end = new Date()
    const start = new Date(end.getFullYear(), end.getMonth(), 1)
    setFrom(start.toISOString().slice(0,10))
    setTo(end.toISOString().slice(0,10))
  }
  const setLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0) // día 0 => último del mes anterior
    setFrom(start.toISOString().slice(0,10))
    setTo(lastDay.toISOString().slice(0,10))
  }
  const setLast30Days = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)
    setFrom(start.toISOString().slice(0,10))
    setTo(end.toISOString().slice(0,10))
  }

  // Sales by day state
  const [salesLoading, setSalesLoading] = useState(false)
  const [sales, setSales] = useState<SalesDay[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [dayDetails, setDayDetails] = useState<Record<string, { orders: any[] }>>({})

  // Debt payments state
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [payments, setPayments] = useState<DebtPayment[]>([])
  const paymentsTotal = useMemo(() => payments.reduce((s, p) => s + (Number(p.amount) || 0), 0), [payments])

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
    const fetchDebtPayments = async () => {
      setPaymentsLoading(true)
      try {
        const res = await fetch(`/api/reports/debt-payments?from=${from}&to=${to}`)
        if (res.ok) {
          const json = await res.json()
          setPayments(json.items || [])
        }
      } finally {
        setPaymentsLoading(false)
      }
    }
    fetchSales()
    fetchDebtPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to])

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
            <Typography variant="body" className="text-muted-foreground">Ventas por día (Pagado o Fiado) y pagos de deudas</Typography>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">Desde: {formatDay(fromDate)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-2 w-auto">
                <DayPicker
                  mode="single"
                  selected={fromDate}
                  onSelect={handleSelectFrom}
                  weekStartsOn={1}
                  locale={es}
                  showOutsideDays
                  captionLayout="dropdown"
                  fromYear={yearNow - 5}
                  toYear={yearNow + 5}
                  defaultMonth={fromDate || toDate || new Date()}
                  disabled={toDate ? { after: toDate } : undefined}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">Hasta: {formatDay(toDate)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-2 w-auto">
                <DayPicker
                  mode="single"
                  selected={toDate}
                  onSelect={handleSelectTo}
                  weekStartsOn={1}
                  locale={es}
                  showOutsideDays
                  captionLayout="dropdown"
                  fromYear={yearNow - 5}
                  toYear={yearNow + 5}
                  defaultMonth={toDate || fromDate || new Date()}
                  disabled={fromDate ? { before: fromDate } : undefined}
                />
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" onClick={setToday}>Hoy</Button>
              <Button variant="ghost" onClick={setLast7Days}>Últimos 7 días</Button>
              <Button variant="ghost" onClick={setThisWeek}>Esta semana</Button>
              <Button variant="ghost" onClick={setThisMonth}>Este mes</Button>
              <Button variant="ghost" onClick={setLastMonth}>Mes pasado</Button>
              <Button variant="ghost" onClick={setLast30Days}>Últimos 30 días</Button>
            </div>
          </div>
        </ResponsiveLayout>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">Ventas por día</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-4 space-y-4">
            <ResponsiveGrid autoFit minItemWidth="220px" gap="md">
              <ResponsiveCard
                title="Pagado"
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
                                <div className="text-xs text-muted-foreground">{d.totalOrders} ventas</div>
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
                                    description={`${new Date(o.created_at).toLocaleTimeString()} • ${o.is_credit_sale ? 'Fiado' : 'Pagado'}`}
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
                      {/* Simplificado: solo mostramos Total por día */}
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
                                <span>{new Date(d.date).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
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
                                        description={`${new Date(o.created_at).toLocaleTimeString()} • ${o.is_credit_sale ? 'Fiado' : 'Pagado'}`}
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

          {/* Sección de pagos de deudas */}
          <div className="mt-6 space-y-3">
            <Typography variant="h2">Pagos de deudas</Typography>
            <ResponsiveGrid autoFit minItemWidth="220px" gap="md">
              <ResponsiveCard
                title="Total pagos"
                headerActions={<span className="text-lg font-semibold">${paymentsTotal.toFixed(2)}</span>}
              >
                <Typography variant="body-sm" className="text-muted-foreground">Suma de pagos de deuda en el rango</Typography>
              </ResponsiveCard>
              <ResponsiveCard
                title="Cantidad de pagos"
                headerActions={<span className="text-lg font-semibold">{payments.length}</span>}
              >
                <Typography variant="body-sm" className="text-muted-foreground">Número de registros</Typography>
              </ResponsiveCard>
            </ResponsiveGrid>

            <Card>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                <Table className="min-w-[560px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      <TableRow><TableCell colSpan={4} className="p-6">Cargando...</TableCell></TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="p-6">Sin pagos</TableCell></TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{new Date(p.created_at).toLocaleString()}</TableCell>
                          <TableCell>{p.customerName || '-'}</TableCell>
                          <TableCell className="hidden sm:table-cell">{p.description || '-'}</TableCell>
                          <TableCell className="text-right">${Number(p.amount).toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </ResponsiveContainer>
  )
}
