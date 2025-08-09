'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PayPalButtons from '@/components/payment/paypal-buttons'

function PaymentContent() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams.get('source') || 'landing'
  const supabase = createClient()

  // Планы и цены
  const plans = {
    free: {
      name: 'Free Plan',
      price: '0',
      features: [
        '5 downloads per day',
        'CSV, Excel, PDF formats',
        'Basic export features'
      ]
    },
    pro: {
      name: 'Pro Plan',
      price: '5.00',
      features: [
        'Unlimited downloads',
        'All formats including Google Sheets',
        'Google Drive export',
        'Priority support'
      ]
    }
  }

  const selectedPlan = 'pro' // Всегда Pro план для оплаты

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          // Если пользователь не авторизован и пришёл не из расширения
          if (source !== 'extension') {
            router.push('/')
            return
          }
        }

        setUser(user)
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, source, supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upgrade to Pro Plan
          </h1>
          <p className="text-gray-600">
            {source === 'extension' 
              ? 'Unlock unlimited downloads and Google Sheets export'
              : 'Get unlimited access to all export features'
            }
          </p>
        </div>

        {/* Сравнение планов */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <div className="text-3xl font-bold text-gray-600 mb-4">
                $0<span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <ul className="text-left space-y-2 mb-6">
                {plans.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                Current Plan
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                $5<span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <ul className="text-left space-y-2 mb-6">
                {plans.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-900">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* PayPal кнопки */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Complete Your Upgrade
          </h3>
          
          <PayPalButtons 
            amount={plans.pro.price}
            planType="pro"
            userId={user?.id}
          />
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by PayPal. Cancel anytime.
          </p>
        </div>

        {/* Информация о безопасности */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}