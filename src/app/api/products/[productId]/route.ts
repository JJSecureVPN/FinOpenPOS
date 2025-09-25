import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const productId = params.productId;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_uid', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Product not found or not authorized' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawBody = await request.json();
  const productId = params.productId;
  
  // Filtrar campos que no pertenecen a la tabla productos
  const { id: _ignoreId, created_at: _ignoreCreatedAt, ...productData } = rawBody || {};
  
  // Validar campos requeridos
  if (productData.name && typeof productData.name !== 'string') {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  if (productData.price && (isNaN(Number(productData.price)) || Number(productData.price) < 0)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }
  if (productData.in_stock && (isNaN(Number(productData.in_stock)) || Number(productData.in_stock) < 0)) {
    return NextResponse.json({ error: 'Invalid stock' }, { status: 400 });
  }

  // Preparar payload de actualización
  const updatePayload = {
    ...productData,
    user_uid: user.id,
    // Normalizar números
    ...(productData.price && { price: Number(productData.price) }),
    ...(productData.in_stock !== undefined && { in_stock: Number(productData.in_stock) })
  };

  const { data, error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId)
    .eq('user_uid', user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data.length === 0) {
    return NextResponse.json({ error: 'Product not found or not authorized' }, { status: 404 })
  }

  return NextResponse.json(data[0])
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const productId = params.productId;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_uid', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Product deleted successfully' })
}
