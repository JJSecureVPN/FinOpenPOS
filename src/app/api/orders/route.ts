import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerId, paymentMethodId, products, total, isCreditSale } = await request.json();

  try {
    // Validar que si es venta al fiado, se requiere customer_id
    if (isCreditSale && !customerId) {
      return NextResponse.json({ 
        error: 'Customer ID is required for credit sales' 
      }, { status: 400 });
    }

    // Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId || null,
        total_amount: total,
        user_uid: user.id,
        status: 'completed',
        is_credit_sale: isCreditSale || false
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Insert the order items
    const orderItems = products.map((product: { id: number, quantity: number, price: number }) => ({
      order_id: orderData.id,
      product_id: product.id,
      quantity: product.quantity,
      price: product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // If there's an error inserting order items, delete the order
      await supabase.from('orders').delete().eq('id', orderData.id);
      throw itemsError;
    }

    // Update product stock for each item sold
    for (const product of products) {
      // Primero obtener el stock actual
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('in_stock')
        .eq('id', product.id)
        .eq('user_uid', user.id)
        .single();

      if (fetchError) {
        console.error(`Error fetching current stock for product ${product.id}:`, fetchError);
        continue;
      }

      // Calcular el nuevo stock
      const newStock = Math.max(0, currentProduct.in_stock - product.quantity);

      // Actualizar el stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ in_stock: newStock })
        .eq('id', product.id)
        .eq('user_uid', user.id);

      if (stockError) {
        console.error(`Error updating stock for product ${product.id}:`, stockError);
        // Nota: No lanzamos error aquí para no interrumpir la venta, solo logueamos
      }
    }

    // Si es venta al fiado, actualizar la deuda del cliente
    if (isCreditSale && customerId) {
      // Obtener la deuda actual del cliente
      const { data: customerData, error: customerFetchError } = await supabase
        .from('customers')
        .select('debt')
        .eq('id', customerId)
        .eq('user_uid', user.id)
        .single();

      if (customerFetchError) {
        console.error('Error fetching customer debt:', customerFetchError);
        // No interrumpir la venta por este error
      } else {
        // Actualizar la deuda del cliente
        const newDebt = (customerData.debt || 0) + total;
        const { error: debtUpdateError } = await supabase
          .from('customers')
          .update({ debt: newDebt })
          .eq('id', customerId)
          .eq('user_uid', user.id);

        if (debtUpdateError) {
          console.error('Error updating customer debt:', debtUpdateError);
          // No interrumpir la venta por este error
        }
      }
    }

    // Insert the transaction record (solo si NO es venta al fiado)
    if (!isCreditSale) {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          order_id: orderData.id,
          payment_method_id: paymentMethodId,
          amount: total,
          user_uid: user.id,
          status: 'completed',
          category: 'Ventas',
          type: 'income',
          description: `Pago por orden #${orderData.id}`
        });

      if (transactionError) {
        // If there's an error inserting the transaction, delete the order and order items
        await supabase.from('orders').delete().eq('id', orderData.id);
        await supabase.from('order_items').delete().eq('order_id', orderData.id);
        throw transactionError;
      }
    }

    return NextResponse.json(orderData);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
