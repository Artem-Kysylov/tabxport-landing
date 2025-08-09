'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface PayPalButtonsProps {
  amount: string
  planType: 'pro' // Убираем 'premium', оставляем только 'pro'
  userId?: string
}

declare global {
  interface Window {
    paypal?: any
  }
}

export default function PayPalButtons({ amount, planType, userId }: PayPalButtonsProps) {
  const paypalRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams.get('source') || 'landing'
  const supabase = createClient()

  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        initializePayPal()
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
      script.async = true
      script.onload = () => initializePayPal()
      script.onerror = () => {
        setError('Ошибка загрузки PayPal SDK')
        setIsLoading(false)
      }
      document.body.appendChild(script)
    }

    const initializePayPal = () => {
      if (!window.paypal || !paypalRef.current) return

      window.paypal.Buttons({
        createOrder: async () => {
          try {
            const response = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount,
                planType,
                userId,
                source
              }),
            })

            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Ошибка создания заказа')
            }

            return data.orderID
          } catch (error) {
            console.error('Ошибка создания заказа:', error)
            setError('Ошибка создания заказа')
            throw error
          }
        },

        onApprove: async (data: any) => {
          try {
            const response = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderID: data.orderID,
                userId,
                planType,
                source
              }),
            })

            const result = await response.json()

            if (!response.ok) {
              throw new Error(result.error || 'Ошибка обработки платежа')
            }

            // Перенаправляем на страницу успеха
            router.push(`/success?source=${source}&plan=${planType}`)
          } catch (error) {
            console.error('Ошибка обработки платежа:', error)
            setError('Ошибка обработки платежа')
            router.push(`/cancel?source=${source}&error=payment_failed`)
          }
        },

        onError: (err: any) => {
          console.error('PayPal ошибка:', err)
          setError('Ошибка PayPal')
          router.push(`/cancel?source=${source}&error=paypal_error`)
        },

        onCancel: () => {
          router.push(`/cancel?source=${source}&error=user_cancelled`)
        },

        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 50
        }
      }).render(paypalRef.current)

      setIsLoading(false)
    }

    loadPayPalScript()
  }, [amount, planType, userId, source, router])

  if (error) {
    return (
      <div className="text-center p-6 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium">Ошибка загрузки PayPal</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {isLoading && (
        <div className="text-center p-6 border border-gray-200 rounded-lg bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Загрузка PayPal...</p>
        </div>
      )}
      <div ref={paypalRef} className={isLoading ? 'hidden' : 'block'} />
    </div>
  )
}