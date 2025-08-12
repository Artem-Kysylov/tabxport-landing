import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validatePayPalWebhook } from '@/lib/paypal/paypal-utils'
import { createOrUpdateSubscription, cancelSubscription } from '@/lib/subscription/subscription-utils'
import { PayPalWebhookEvent } from '@/types/paypal'
import { PaymentNotifications } from '@/lib/email/payment-notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookEvent: PayPalWebhookEvent = JSON.parse(body)
    
    // Получаем заголовки для валидации
    const headers = {
      'paypal-transmission-id': request.headers.get('paypal-transmission-id'),
      'paypal-cert-id': request.headers.get('paypal-cert-id'),
      'paypal-transmission-sig': request.headers.get('paypal-transmission-sig'),
      'paypal-transmission-time': request.headers.get('paypal-transmission-time'),
      'paypal-auth-algo': request.headers.get('paypal-auth-algo'),
    }

    // Валидация webhook подписи
    if (!validatePayPalWebhook(headers, body)) {
      console.error('Invalid PayPal webhook signature')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Проверяем, не обрабатывали ли мы уже этот webhook
    const { data: existingWebhook } = await supabaseAdmin
      .from('paypal_webhooks')
      .select('id')
      .eq('event_id', webhookEvent.id)
      .single()

    if (existingWebhook) {
      console.log(`Webhook ${webhookEvent.id} already processed`)
      return NextResponse.json({ received: true, status: 'already_processed' })
    }

    // Сохраняем webhook в базе данных для логирования
    const { error: insertError } = await supabaseAdmin
      .from('paypal_webhooks')
      .insert({
        event_id: webhookEvent.id,
        event_type: webhookEvent.event_type,
        resource_type: webhookEvent.resource_type,
        resource_id: webhookEvent.resource.id,
        data: webhookEvent,
        processed: false,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error saving webhook to database:', insertError)
    }

    // Обрабатываем различные типы событий
    let processed = false
    
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        processed = await handlePaymentCompleted(webhookEvent)
        break
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        processed = await handlePaymentFailed(webhookEvent)
        break
      case 'BILLING.SUBSCRIPTION.CREATED':
        processed = await handleSubscriptionCreated(webhookEvent)
        break
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        processed = await handleSubscriptionActivated(webhookEvent)
        break
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        processed = await handleSubscriptionCancelled(webhookEvent)
        break
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        processed = await handleSubscriptionExpired(webhookEvent)
        break
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        processed = await handleSubscriptionPaymentFailed(webhookEvent)
        break
      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event_type}`)
        processed = true // Помечаем как обработанный, чтобы не повторять
    }

    // Обновляем статус обработки webhook
    if (processed) {
      await supabaseAdmin
        .from('paypal_webhooks')
        .update({ 
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('event_id', webhookEvent.id)
    }

    return NextResponse.json({ 
      received: true, 
      processed,
      event_type: webhookEvent.event_type 
    })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Обработка успешного платежа
async function handlePaymentCompleted(event: PayPalWebhookEvent): Promise<boolean> {
  try {
    const paymentId = event.resource.id
    // Безопасный доступ к вложенным свойствам
    const supplementaryData = event.resource.supplementary_data as { related_ids?: { order_id?: string } } | undefined
    const orderId = supplementaryData?.related_ids?.order_id

    // Обновляем статус платежа
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({ 
        status: 'completed',
        provider_payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('provider_order_id', orderId)

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return false
    }

    // Получаем информацию о платеже для активации подписки
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('user_id, plan_type, amount, currency')
      .eq('provider_order_id', orderId)
      .single()


    
    // В функции handlePaymentCompleted добавьте:
    
    if (payment) {
    // Активируем подписку пользователя
    await createOrUpdateSubscription(
    payment.user_id,
    paymentId, // Используем payment ID как subscription ID для разовых платежей
    payment.plan_type,
    'active'
    )
    
    // Получаем email пользователя
    const { data: userData } = await supabaseAdmin
      .from('auth.users')
      .select('email')
      .eq('id', payment.user_id)
      .single()
    
    if (userData?.email && orderId) {
      await PaymentNotifications.sendPaymentConfirmation(
        userData.email,
        {
          amount: payment.amount,
          currency: payment.currency,
          plan: payment.plan_type,
          orderId: orderId,
          date: new Date()
        }
      )
      
      // Уведомляем администратора
      await PaymentNotifications.sendAdminPaymentSuccess(
        'tabxport@gmail.com',
        {
          userEmail: userData.email,
          amount: payment.amount,
          currency: payment.currency,
          plan: payment.plan_type,
          orderId,
          paymentId
        }
      )
    }
    }

    return true
  } catch (error) {
    console.error('Error handling payment completed:', error)
    return false
  }
}

// Обработка неудачного платежа
async function handlePaymentFailed(event: PayPalWebhookEvent): Promise<boolean> {
  try {
    const paymentId = event.resource.id
    // Безопасный доступ к вложенным свойствам
    const supplementaryData = event.resource.supplementary_data as { related_ids?: { order_id?: string } } | undefined
    const orderId = supplementaryData?.related_ids?.order_id

    // Обновляем статус платежа
    const { error } = await supabaseAdmin
      .from('payments')
      .update({ 
        status: 'failed',
        provider_payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('provider_order_id', orderId)

    if (error) {
      console.error('Error updating payment status:', error)
      return false
    }

    // Получаем информацию о платеже для уведомления
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('user_id, amount, currency')
      .eq('provider_order_id', orderId)
      .single()

    if (payment) {
      // Получаем email пользователя
      const { data: userData } = await supabaseAdmin
        .from('auth.users')
        .select('email')
        .eq('id', payment.user_id)
        .single()

      if (userData?.email) {
        // Уведомляем администратора о неудачном платеже
        await PaymentNotifications.sendAdminPaymentFailed('tabxport@gmail.com', {
          userEmail: userData.email,
          amount: payment.amount,
          currency: payment.currency,
          orderId,
          paymentId,
          reason: `PayPal event: ${event.event_type}`
        })
      }
    }

    return true
  } catch (error) {
    console.error('Error handling payment failed:', error)
    return false
  }
}

// Обработка создания подписки
async function handleSubscriptionCreated(event: PayPalWebhookEvent): Promise<boolean> {
  try {
    console.log('Subscription created:', event.resource.id)
    // Подписка создана, но еще не активна
    // Обычно следует событие BILLING.SUBSCRIPTION.ACTIVATED
    return true
  } catch (error) {
    console.error('Error handling subscription created:', error)
    return false
  }
}

// Обработка активации подписки
async function handleSubscriptionActivated(event: PayPalWebhookEvent): Promise<boolean> {
  try {
    const subscriptionId = event.resource.id
    const planId = event.resource.plan_id

    // Находим пользователя по subscription ID или другим данным
    // Это зависит от того, как мы связываем PayPal подписки с пользователями
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('paypal_subscription_id', subscriptionId)
      .single()

    if (subscription) {
      await createOrUpdateSubscription(
        subscription.user_id,
        subscriptionId,
        'pro', // Определяем тип плана на основе plan_id
        'active'
      )
    }

    return true
  } catch (error) {
    console.error('Error handling subscription activated:', error)
    return false
  }
}

// Обработка отмены подписки
async function handleSubscriptionCancelled(event: PayPalWebhookEvent): Promise<boolean> {
  try {
    const subscriptionId = event.resource.id

    // Находим пользователя и отменяем подписку
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('paypal_subscription_id', subscriptionId)
      .single()

    if (subscription) {
      await cancelSubscription(subscription.user_id)
    }

    return true
  } catch (error) {
    console.error('Error handling subscription cancelled:', error)
    return false
  }
}

// Обработка истечения подписки
async function handleSubscriptionExpired(event: PayPalWebhookEvent): Promise<boolean> {
  try {
    const subscriptionId = event.resource.id

    // Обновляем статус подписки на expired
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription to expired:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error handling subscription expired:', error)
    return false
  }
}

// Обработка неудачного платежа по подписке
async function handleSubscriptionPaymentFailed(event: PayPalWebhookEvent): Promise<boolean> {
  try {
    const subscriptionId = event.resource.id

    // Найдем пользователя по subscriptionId
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('paypal_subscription_id', subscriptionId)
      .single()

    let userEmail: string | undefined
    let amount: number | undefined
    let currency: string | undefined
    let orderId: string | undefined
    let paymentId: string | undefined

    if (subscription?.user_id) {
      // Получим email пользователя
      const { data: userData } = await supabaseAdmin
        .from('auth.users')
        .select('email')
        .eq('id', subscription.user_id)
        .single()
      userEmail = userData?.email ?? undefined

      // Попробуем достать последний платеж пользователя (для контекста)
      const { data: lastPayment } = await supabaseAdmin
        .from('payments')
        .select('amount, currency, provider_order_id, provider_payment_id')
        .eq('user_id', subscription.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (lastPayment) {
        amount = lastPayment.amount
        currency = lastPayment.currency
        orderId = lastPayment.provider_order_id ?? undefined
        paymentId = lastPayment.provider_payment_id ?? undefined
      }
    }

    // reason: пытаемся взять summary, если нет в типах — безопасно приводим к any
    const reason =
      (event as unknown as { summary?: string })?.summary ||
      'BILLING.SUBSCRIPTION.PAYMENT.FAILED'

    await PaymentNotifications.sendAdminPaymentFailed('tabxport@gmail.com', {
      userEmail,
      amount,
      currency,
      orderId,
      paymentId,
      reason,
    })

    return true
  } catch (error) {
    console.error('Error handling subscription payment failed:', error)
    return false
  }
}