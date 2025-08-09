import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PayPalCaptureRequest } from '@/types/paypal'
import { PaymentNotifications } from '@/lib/email/payment-notifications'

const PAYPAL_BASE_URL = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { orderID }: PayPalCaptureRequest = await request.json()
    const supabase = await createClient()

    // Получить текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получить токен доступа PayPal
    const accessToken = await getPayPalAccessToken()

    // Захватить платеж
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const captureData = await response.json()

    if (!response.ok) {
      throw new Error(captureData.message || 'Failed to capture PayPal order')
    }

    // Получить данные платежа
    const capture = captureData.purchase_units[0].payments.captures[0]
    
    // Найти или создать подписку
    const { data: existingSubscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let subscriptionId = existingSubscription?.id

    // Если подписки нет, создаем новую
    if (!existingSubscription) {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 год

      const { data: newSubscription, error: createSubError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'pro',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: expiresAt.toISOString(),
          paypal_subscription_id: null, // Пока null, обновим через webhook
          paypal_plan_id: null
        })
        .select('id')
        .single()

      if (createSubError) {
        console.error('Failed to create subscription:', createSubError)
        throw new Error('Failed to create subscription')
      }

      subscriptionId = newSubscription?.id
    }

    // Сохранить платеж в базе данных
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        amount: parseFloat(capture.amount.value),
        currency: capture.amount.currency_code,
        status: capture.status === 'COMPLETED' ? 'completed' : 'pending',
        provider: 'paypal',
        paypal_order_id: orderID,
        paypal_payment_id: capture.id,
        provider_data: captureData
      })

    if (paymentError) {
      console.error('Failed to save payment:', paymentError)
      // Платеж прошел, но не сохранился - нужно обработать вручную
    }

    // Обновить подписку при успешном платеже
    if (capture.status === 'COMPLETED' && subscriptionId) {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 год

      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: expiresAt.toISOString()
        })
        .eq('user_id', user.id)

      if (subscriptionError) {
        console.error('Failed to update subscription:', subscriptionError)
      }
      
      // Отправляем email-уведомление о успешном платеже
      try {
        await PaymentNotifications.sendPaymentConfirmation(
          user.email || '',
          {
            amount: parseFloat(capture.amount.value),
            currency: capture.amount.currency_code,
            plan: 'pro',
            orderId: orderID,
            date: new Date()
          }
        )
        
        // Уведомляем администратора
        await PaymentNotifications.sendAdminPaymentSuccess(
          'tabxport@gmail.com',
          {
            userEmail: user.email || '',
            amount: parseFloat(capture.amount.value),
            currency: capture.amount.currency_code,
            plan: 'pro',
            orderId: orderID,
            paymentId: capture.id
          }
        )
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError)
        // Не прерываем выполнение, если email не отправился
      }
    }

    return NextResponse.json({ 
      success: true, 
      captureID: capture.id,
      status: capture.status 
    })
  } catch (error) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json(
      { error: 'Failed to capture order' },
      { status: 500 }
    )
  }
}