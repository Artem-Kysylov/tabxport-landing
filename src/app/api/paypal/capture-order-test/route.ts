import { NextRequest, NextResponse } from 'next/server'
import { PayPalCaptureRequest } from '@/types/paypal'

const PAYPAL_BASE_URL = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  console.log('PayPal Auth - Client ID exists:', !!process.env.PAYPAL_CLIENT_ID)
  console.log('PayPal Auth - Client Secret exists:', !!process.env.PAYPAL_CLIENT_SECRET)

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
    const { orderID }: PayPalCaptureRequest = await request.json()
    console.log('Capturing PayPal order:', orderID)

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
    console.log('PayPal Capture Response Status:', response.status)
    console.log('PayPal Capture Response:', JSON.stringify(captureData, null, 2))

    if (!response.ok) {
      console.error('PayPal Capture Failed:', captureData)
      throw new Error(captureData.message || captureData.error_description || 'Failed to capture PayPal order')
    }

    // Для тестирования - просто возвращаем успешный результат без сохранения в БД
    const capture = captureData.purchase_units[0].payments.captures[0]
    
    console.log('PayPal Capture Success:', capture.id)
    console.log('Capture Status:', capture.status)
    console.log('Amount:', capture.amount.value, capture.amount.currency_code)

    return NextResponse.json({ 
      success: true, 
      captureID: capture.id,
      status: capture.status,
      amount: capture.amount.value,
      currency: capture.amount.currency_code,
      message: 'Payment captured successfully (test mode)'
    })
  } catch (error) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture order' },
      { status: 500 }
    )
  }
}