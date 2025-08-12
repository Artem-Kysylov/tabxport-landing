'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function CancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const source = searchParams.get('source') || 'landing'
  const error = searchParams.get('error') || 'unknown'
  
  // Определяем сообщение об ошибке
  const getErrorMessage = () => {
    switch (error) {
      case 'user_cancelled':
        return {
          title: 'Payment Cancelled',
          message: 'You cancelled the payment process. No charges were made to your account.',
          icon: '⚠️'
        }
      case 'payment_failed':
        return {
          title: 'Payment Failed',
          message: 'There was an issue processing your payment. Please try again or use a different payment method.',
          icon: '❌'
        }
      case 'paypal_error':
        return {
          title: 'PayPal Error',
          message: 'PayPal encountered an error while processing your payment. Please try again later.',
          icon: '🔧'
        }
      default:
        return {
          title: 'Payment Issue',
          message: 'Something went wrong with your payment. Please try again.',
          icon: '⚠️'
        }
    }
  }

  const errorInfo = getErrorMessage()

  const handleTryAgain = () => {
    router.push(`/payment?source=${source}`)
  }

  const handleBackToHome = () => {
    if (source === 'extension') {
      // Если пришли из расширения, показываем инструкцию
      alert('You can close this tab and try upgrading again from the extension')
    } else {
      router.push('/')
    }
  }

  const handleContactSupport = () => {
    window.open('mailto:support@tablexport.com?subject=Payment Issue&body=I encountered an issue with payment. Error: ' + error, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Иконка ошибки */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">{errorInfo.icon}</span>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {errorInfo.message}
          </p>

          {/* Информация о том, что делать дальше */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">What's Next?</h3>
            <p className="text-yellow-800 text-sm">
              {error === 'user_cancelled' 
                ? 'You can try the payment process again when you\'re ready.'
                : 'Please try again or contact our support team if the issue persists.'
              }
            </p>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain}
              className="w-full"
            >
              Try Payment Again
            </Button>
            
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="w-full"
            >
              {source === 'extension' ? 'Close' : 'Back to Home'}
            </Button>

            {error !== 'user_cancelled' && (
              <Button 
                onClick={handleContactSupport}
                variant="ghost"
                className="w-full text-sm"
              >
                Contact Support
              </Button>
            )}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              No charges were made to your account
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  )
}