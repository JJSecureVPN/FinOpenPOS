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

    // Obtener transacciones relacionadas con el cliente (ventas directas)
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_uid', user.id)
      .ilike('description', `%${customer.name}%`) // Buscar transacciones que mencionen al cliente
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
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

    // Calcular estadísticas basadas en transacciones
    const customerTransactions = transactions?.filter(t => 
      t.description?.toLowerCase().includes(customer.name.toLowerCase())
    ) || [];
    
    const totalTransactions = customerTransactions.length;
    const totalIncomeFromCustomer = customerTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
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

    // Agregar transacciones al timeline
    if (customerTransactions && customerTransactions.length > 0) {
      customerTransactions.forEach(transaction => {
        timeline.push({
          id: `transaction-${transaction.id}`,
          type: 'sale',
          date: transaction.date || transaction.created_at,
          amount: transaction.amount,
          description: transaction.description || `Venta #${transaction.id}`,
          transactionType: transaction.type,
          status: transaction.status,
          paymentMethod: transaction.payment_method
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

    const formattedTransactions = customerTransactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      created_at: transaction.date || transaction.created_at,
      description: transaction.description,
      payment_method: transaction.payment_method
    }));

    console.log('Customer transactions:', JSON.stringify(formattedTransactions, null, 2));

    return NextResponse.json({
      customer,
      transactions: formattedTransactions,
      debtPayments: debtPayments || [],
      timeline,
      statistics: {
        totalTransactions,
        totalIncomeFromCustomer,
        totalPayments: debtPayments?.length || 0,
        totalDebtPayments,
        currentDebt,
        averageTransactionValue: totalTransactions > 0 ? totalIncomeFromCustomer / totalTransactions : 0
      }
    });

  } catch (error) {
    console.error('Error fetching customer history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customer history' 
    }, { status: 500 });
  }
}