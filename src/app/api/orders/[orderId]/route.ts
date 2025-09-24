import { NextResponse } from 'next/server'

// Gestión de pedidos eliminada: sólo ventas en vivo (creación vía POST /api/orders)
export async function PUT() {
  return NextResponse.json({
    error: 'Gestión de pedidos deshabilitada: esta app sólo maneja ventas en vivo.'
  }, { status: 410 })
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Gestión de pedidos deshabilitada: esta app sólo maneja ventas en vivo.'
  }, { status: 410 })
}
