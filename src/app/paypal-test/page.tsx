'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    paypal?: any
  }
}

export default function PayPalTestPage() {
  const paypalRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

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
            setResult('Создание заказа...')
            setError(null)
            
            const response = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                planType: 'pro',
                amount: '5.00',
                userId: 'test-user-id',
                source: 'test'
              }),
            })

            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error || 'Ошибка создания заказа')
            }

            setResult(`Заказ создан: ${data.orderID}`)
            return data.orderID
          } catch (error) {
            console.error('Ошибка создания заказа:', error)
            setError(`Ошибка создания заказа: ${error}`)
            setResult(`Ошибка: ${error}`)
            throw error
          }
        },

        onApprove: async (data: any) => {
          try {
            setResult('Обработка платежа...')
            setError(null)
            
            // Используем тестовый endpoint без авторизации
            const response = await fetch('/api/paypal/capture-order-test', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderID: data.orderID,
                userId: 'test-user-id',
                planType: 'pro',
                source: 'test'
              }),
            })

            const result = await response.json()

            if (!response.ok) {
              throw new Error(result.error || 'Ошибка обработки платежа')
            }

            setResult(`✅ Платеж успешен! 
            Order ID: ${data.orderID}
            Capture ID: ${result.captureID}
            Status: ${result.status}
            Amount: ${result.amount} ${result.currency}
            ${result.message}`)
          } catch (error) {
            console.error('Ошибка обработки платежа:', error)
            setError(`Ошибка обработки платежа: ${error}`)
            setResult(`Ошибка обработки: ${error}`)
          }
        },

        onError: (err: any) => {
          console.error('PayPal ошибка:', err)
          setError(`PayPal ошибка: ${err}`)
          setResult(`PayPal ошибка: ${err}`)
        },

        onCancel: () => {
          setResult('Платеж отменен пользователем')
          setError(null)
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
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          PayPal Sandbox Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Pro Plan - $5.00</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-600 font-medium">Ошибка обработки платежа: {error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <p className="text-blue-600 whitespace-pre-line">Ошибка обработки: {result}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="text-center p-6 border border-gray-200 rounded-lg bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Загрузка PayPal...</p>
            </div>
          )}
          
          <div ref={paypalRef} className={isLoading ? 'hidden' : 'block'} />
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Тестовые данные PayPal Sandbox:</h3>
          <p className="text-yellow-700 text-sm">
            Email: sb-buyer@personal.example.com<br/>
            Password: testpassword123<br/>
            Или используйте ваш созданный тестовый аккаунт
          </p>
        </div>
      </div>
    </div>
  )
}