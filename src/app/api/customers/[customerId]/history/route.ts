import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customerId = parseInt(params.customerId);

  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  try {
    // Obtener información del cliente
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_uid', user.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Obtener órdenes del cliente (tanto normales como al fiado)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        is_credit_sale,
        created_at,
        order_items (
          id,
          quantity,
          price,
          product:product_id (
            name
          )
        )
      `)
      .eq('customer_id', customerId)
      .eq('user_uid', user.id)
      .order('created_at', { ascending: false });

    console.log('Orders fetched:', JSON.stringify(orders, null, 2));

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Obtener pagos de deuda del cliente
    const { data: debtPayments, error: paymentsError } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_uid', user.id)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching debt payments:', paymentsError);
    }

    // Calcular estadísticas
    const totalPurchases = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalCreditSales = orders?.filter(order => order.is_credit_sale).length || 0;
    const totalCreditAmount = orders?.filter(order => order.is_credit_sale)
      .reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalDebtPayments = debtPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const currentDebt = customer.debt || 0;

    // Crear timeline combinado de actividad
    const timeline: Array<{
      id?: string;
      type: string;
      description: string;
      date: string;
      amount?: number;
      isCreditSale?: boolean;
      paymentId?: number;
      [key: string]: any;
    }> = [];

    // Agregar órdenes al timeline
    if (orders) {
      orders.forEach(order => {
        timeline.push({
          id: `order-${order.id}`,
          type: 'order',
          date: order.created_at,
          amount: order.total_amount,
          description: order.is_credit_sale 
            ? `Venta al fiado #${order.id}` 
            : `Compra #${order.id}`,
          isCreditSale: order.is_credit_sale,
          status: order.status,
          items: order.order_items
        });
      });
    }

    // Agregar pagos de deuda al timeline
    if (debtPayments) {
      debtPayments.forEach(payment => {
        timeline.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          date: payment.created_at,
          amount: payment.amount,
          description: payment.description || `Pago de deuda`,
          paymentId: payment.id
        });
      });
    }

    // Ordenar timeline por fecha (más reciente primero)
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const formattedOrders = orders?.map(order => ({
      id: order.id,
      total: order.total_amount,
      status: order.status,
      is_credit: order.is_credit_sale,
      created_at: order.created_at,
      items: order.order_items?.map((item: any) => {
        let productName = 'Producto desconocido';
        try {
          if (item.product) {
            if (Array.isArray(item.product) && item.product[0]) {
              productName = item.product[0].name || productName;
            } else if (item.product.name) {
              productName = item.product.name;
            }
          }
        } catch (e) {
          console.error('Error getting product name:', e);
        }
        
        return {
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
          product_name: productName
        };
      }) || []
    })) || [];

    console.log('Formatted orders:', JSON.stringify(formattedOrders, null, 2));

    return NextResponse.json({
      customer,
      orders: formattedOrders,
      debtPayments: debtPayments || [],
      timeline,
      statistics: {
        totalOrders: totalPurchases,
        totalSpent,
        totalPayments: debtPayments?.length || 0,
        totalCreditSales,
        totalCreditAmount,
        totalDebtPayments,
        currentDebt,
        averageOrderValue: totalPurchases > 0 ? totalSpent / totalPurchases : 0
      }
    });

  } catch (error) {
    console.error('Error fetching customer history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customer history' 
    }, { status: 500 });
  }
}