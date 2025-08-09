import { NextRequest, NextResponse } from 'next/server'
import { PayPalOrderRequest } from '@/types/paypal'
import { PRICING_PLANS } from '@/types/paypal'

const PAYPAL_BASE_URL = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  console.log('PayPal Auth - Client ID exists:', !!process.env.PAYPAL_CLIENT_ID)
  console.log('PayPal Auth - Client Secret exists:', !!process.env.PAYPAL_CLIENT_SECRET)
  console.log('PayPal Base URL:', PAYPAL_BASE_URL)

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  
  if (!response.ok) {
    console.error('PayPal Auth Error:', data)
    throw new Error(`PayPal authentication failed: ${data.error_description || data.error}`)
  }
  
  console.log('PayPal Auth Success - Token received')
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { planType }: PayPalOrderRequest = await request.json()
    console.log('Creating PayPal order for plan:', planType)

    // Найти план
    const plan = PRICING_PLANS.find(p => p.id === planType)
    if (!plan) {
      console.error('Invalid plan type:', planType)
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    console.log('Plan found:', plan)

    // Получить токен доступа
    const accessToken = await getPayPalAccessToken()

    // Создать заказ
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: plan.currency,
            value: plan.price.toString(),
          },
          description: `${plan.name} Plan - TableXport`,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      },
    }

    console.log('Order data:', JSON.stringify(orderData, null, 2))

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    const order = await response.json()
    console.log('PayPal API Response Status:', response.status)
    console.log('PayPal API Response:', JSON.stringify(order, null, 2))

    if (!response.ok) {
      console.error('PayPal Order Creation Failed:', order)
      throw new Error(order.message || order.error_description || 'Failed to create PayPal order')
    }

    console.log('PayPal Order Created Successfully:', order.id)
    return NextResponse.json({ orderID: order.id })
  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}