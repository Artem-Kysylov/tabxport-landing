interface PayPalTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface PayPalOrderRequest {
  intent: 'CAPTURE'
  purchase_units: Array<{
    amount: {
      currency_code: string
      value: string
    }
    description?: string
  }>
  application_context?: {
    return_url?: string
    cancel_url?: string
    brand_name?: string
    user_action?: 'PAY_NOW'
  }
}

// Получение access token от PayPal
export async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'
  
  const baseUrl = environment === 'production' 
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com'

  if (!clientId || !clientSecret) {
    console.error('PayPal credentials not configured')
    return null
  }

  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      console.error('Failed to get PayPal access token:', response.statusText)
      return null
    }

    const data: PayPalTokenResponse = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting PayPal access token:', error)
    return null
  }
}

// Создание PayPal заказа
export async function createPayPalOrder(amount: string, description: string = 'TableXport Pro Subscription'): Promise<any> {
  const accessToken = await getPayPalAccessToken()
  if (!accessToken) {
    throw new Error('Failed to get PayPal access token')
  }

  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'
  const baseUrl = environment === 'production' 
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com'

  const baseAppUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const orderData: PayPalOrderRequest = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount
      },
      description
    }],
    application_context: {
      return_url: `${baseAppUrl}/success`,
      cancel_url: `${baseAppUrl}/cancel`,
      brand_name: 'TableXport',
      user_action: 'PAY_NOW'
    }
  }

  try {
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('PayPal order creation failed:', errorData)
      throw new Error(`PayPal API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    throw error
  }
}

// Захват PayPal платежа
export async function capturePayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken()
  if (!accessToken) {
    throw new Error('Failed to get PayPal access token')
  }

  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'
  const baseUrl = environment === 'production' 
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com'

  try {
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('PayPal order capture failed:', errorData)
      throw new Error(`PayPal capture error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    throw error
  }
}

// Валидация PayPal webhook
export async function validatePayPalWebhook(headers: any, body: string): Promise<boolean> {
  try {
    // Проверяем наличие необходимых заголовков
    const requiredHeaders = [
      'paypal-transmission-id',
      'paypal-cert-id', 
      'paypal-transmission-sig',
      'paypal-transmission-time',
      'paypal-auth-algo'
    ]

    for (const header of requiredHeaders) {
      if (!headers[header]) {
        console.error(`Missing required header: ${header}`)
        return false
      }
    }

    // В production среде здесь должна быть полная валидация подписи
    // с использованием PayPal API для верификации webhook
    const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'
    
    if (environment === 'production') {
      // TODO: Implement full webhook signature validation for production
      // https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
      
      const accessToken = await getPayPalAccessToken()
      if (!accessToken) {
        return false
      }

      const baseUrl = 'https://api.paypal.com'
      const webhookId = process.env.PAYPAL_WEBHOOK_ID

      if (!webhookId) {
        console.error('PAYPAL_WEBHOOK_ID not configured')
        return false
      }

      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body)
      }

      const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(verificationData)
      })

      if (!response.ok) {
        console.error('PayPal webhook verification failed:', response.statusText)
        return false
      }

      const result = await response.json()
      return result.verification_status === 'SUCCESS'
    }

    // Для sandbox среды используем упрощенную валидацию
    console.log('PayPal webhook validation (sandbox mode) - headers present:', 
      requiredHeaders.every(h => headers[h]))
    
    return true
  } catch (error) {
    console.error('Error validating PayPal webhook:', error)
    return false
  }
}

// Форматирование суммы для PayPal
export function formatAmountForPayPal(amount: number): string {
  return amount.toFixed(2)
}

// Проверка валидности PayPal order ID
export function isValidPayPalOrderId(orderId: string): boolean {
  // PayPal order IDs обычно имеют формат: 1AB23456CD789012E
  const paypalOrderIdRegex = /^[A-Z0-9]{17}$/
  return paypalOrderIdRegex.test(orderId)
}