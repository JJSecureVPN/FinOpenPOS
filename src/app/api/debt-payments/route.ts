import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { customerId, amount, description } = await request.json();

    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'Customer ID and valid amount are required' 
      }, { status: 400 });
    }

    // Verificar que el cliente existe y obtener su deuda actual
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, debt')
      .eq('id', customerId)
      .eq('user_uid', user.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ 
        error: 'Customer not found' 
      }, { status: 404 });
    }

    if (customer.debt < amount) {
      return NextResponse.json({ 
        error: 'Payment amount cannot exceed customer debt' 
      }, { status: 400 });
    }

    // Registrar el pago de deuda
    const { data: debtPayment, error: paymentError } = await supabase
      .from('debt_payments')
      .insert([{
        customer_id: customerId,
        amount: amount,
        user_uid: user.id,
        description: description || `Pago de deuda de ${customer.name}`
      }])
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Actualizar la deuda del cliente
    const newDebt = customer.debt - amount;
    const { error: updateError } = await supabase
      .from('customers')
      .update({ debt: newDebt })
      .eq('id', customerId);

    if (updateError) {
      throw updateError;
    }

    // Crear transacción de ingreso por el pago
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        description: `Pago de deuda - ${customer.name}`,
        amount: amount,
        type: 'income',
        category: 'Pago de Deuda',
        status: 'completed',
        user_uid: user.id
      }]);

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // No fallar completamente si hay error en transaction
    } else {
      console.log(`Transaction created successfully for debt payment: $${amount} from ${customer.name}`);
    }

    return NextResponse.json({ 
      success: true,
      payment: debtPayment,
      newDebt: newDebt,
      message: `Pago de $${amount.toFixed(2)} procesado correctamente. Nueva deuda: $${newDebt.toFixed(2)}`
    });

  } catch (error) {
    console.error('Error processing debt payment:', error);
    return NextResponse.json({ 
      error: 'Failed to process debt payment' 
    }, { status: 500 });
  }
}