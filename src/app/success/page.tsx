'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ChromeStoreButton from '@/components/ui/chrome-store-button'

function SuccessContent() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source') || 'landing'
  const plan = searchParams.get('plan') || 'pro'
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false)

  useEffect(() => {
    // Проверяем, установлено ли расширение
    const checkExtension = () => {
      // Это будет работать только если расширение добавляет специальный элемент на страницу
      const extensionElement = document.querySelector('[data-tablexport-extension]')
      setIsExtensionInstalled(!!extensionElement)
    }

    checkExtension()
    // Проверяем через небольшую задержку на случай, если расширение загружается
    setTimeout(checkExtension, 1000)
  }, [])

  const handleBackToSite = () => {
    if (source === 'extension') {
      // Если пришли из расширения, показываем инструкцию
      alert('Вернитесь на сайт где работает расширение и обновите страницу')
    } else {
      // Если с лендинга, перенаправляем на главную
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Иконка успеха */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your Pro plan is now active. You have unlimited downloads and access to all formats including Google Sheets export.
          </p>

          {/* Инструкции в зависимости от источника */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            {source === 'extension' ? (
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                <p className="text-blue-800 text-sm">
                  Return to the website where TableXport extension works and refresh the page to access your Pro features.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Get Started:</h3>
                {isExtensionInstalled ? (
                  <p className="text-blue-800 text-sm">
                    Great! The extension is installed. Visit any website with tables to start using your Pro features.
                  </p>
                ) : (
                  <p className="text-blue-800 text-sm">
                    Install the TableXport extension to start using your Pro features on any website.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            {source !== 'extension' && !isExtensionInstalled && (
              <ChromeStoreButton className="w-full">
                Install Chrome Extension
              </ChromeStoreButton>
            )}
            
            <Button 
              onClick={handleBackToSite}
              variant="outline"
              className="w-full"
            >
              {source === 'extension' ? 'Got it!' : 'Back to Home'}
            </Button>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help? Contact us at support@tablexport.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}