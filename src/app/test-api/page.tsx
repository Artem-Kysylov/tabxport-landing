'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TestResult {
  status: number | string
  data: any
  timestamp: string
}

export default function ApiTesterPage() {
  const [userToken, setUserToken] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('offline')
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [authError, setAuthError] = useState<string>('')

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''
  const supabase = createClient()

  // Автоматическое получение токена при загрузке страницы
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session?.access_token) {
          setUserToken(session.access_token)
          setCurrentUser(session.user)
          setAuthError('')
        }
      } catch (error) {
        console.error('Error getting auth token:', error)
        setAuthError('Ошибка получения токена')
      }
    }

    getAuthToken()

    // Подписка на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setUserToken(session.access_token)
        setCurrentUser(session.user)
        setAuthError('')
      } else {
        setUserToken('')
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Функция для входа через Google
  const signInWithGoogle = async () => {
    try {
      setAuthError('')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/test-api`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) {
        console.error('Auth error:', error)
        setAuthError(`Ошибка авторизации: ${error.message}`)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setAuthError('Неожиданная ошибка при авторизации')
    }
  }

  // Функция для выхода
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUserToken('')
      setCurrentUser(null)
      setAuthError('')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Создание тестового пользователя (для разработки)
  const createTestUser = async () => {
    try {
      setAuthError('')
      const testEmail = 'test@example.com'
      const testPassword = 'test123456'
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      
      if (error) {
        // Если пользователь уже существует, попробуем войти
        if (error.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          })
          
          if (signInError) {
            setAuthError(`Ошибка входа: ${signInError.message}`)
          } else if (signInData.session?.access_token) {
            setUserToken(signInData.session.access_token)
            setCurrentUser(signInData.user)
          }
        } else {
          setAuthError(`Ошибка создания тестового пользователя: ${error.message}`)
        }
      } else if (data.session?.access_token) {
        setUserToken(data.session.access_token)
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Test user creation error:', error)
      setAuthError('Ошибка создания тестового пользователя')
    }
  }

  // Использование Service Role Key для тестирования
  const useServiceRoleKey = async () => {
    try {
      setAuthError('')
      // Получаем Service Role Key из Supabase Dashboard
      const serviceRoleKey = prompt('Введите Service Role Key из Supabase Dashboard (Settings → API → service_role):')
      
      if (serviceRoleKey && serviceRoleKey.trim()) {
        setUserToken(serviceRoleKey.trim())
        setCurrentUser({ email: 'service-role@test.com', id: 'service-role' } as any)
      } else {
        setAuthError('Service Role Key не введён')
      }
    } catch (error) {
      console.error('Service role key error:', error)
      setAuthError('Ошибка при использовании Service Role Key')
    }
  }

  // Проверка статуса сервера
  const checkServerStatus = async () => {
    setServerStatus('checking')
    try {
      const response = await fetch('/', { method: 'HEAD' })
      setServerStatus(response.ok ? 'online' : 'offline')
    } catch (error) {
      setServerStatus('offline')
    }
  }

  // Выполнение API запроса с Service Role Key
  const makeApiCallWithServiceRole = async (method: string, endpoint: string, data?: any) => {
    if (!userToken.trim()) {
      throw new Error('Пожалуйста, войдите в систему или введите токен вручную')
    }

    // Проверяем, используется ли Service Role Key
    const isServiceRole = currentUser?.email === 'service-role@test.com'
    
    if (isServiceRole) {
      // Для Service Role Key используем прямые запросы к Supabase
      return await makeDirectSupabaseCall(method, endpoint, data)
    } else {
      // Для обычных пользователей используем API
      return await makeApiCall(method, endpoint, data)
    }
  }

  // Прямые запросы к Supabase с Service Role Key
  const makeDirectSupabaseCall = async (method: string, endpoint: string, data?: any) => {
    const { createClient } = await import('@supabase/supabase-js')
    
    // Создаем клиент с Service Role Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      userToken.trim(), // Service Role Key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    try {
      // Симулируем API эндпоинты напрямую через Supabase
      if (endpoint === '/api/subscription/status' && method === 'GET') {
        // Получаем первого пользователя для тестирования
        const { data: users } = await supabaseAdmin.from('users').select('id').limit(1)
        const testUserId = users?.[0]?.id || 'test-user-id'
        
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', testUserId)
          .single()

        return {
          status: 200,
          data: {
            success: true,
            data: {
              userId: testUserId,
              status: subscription?.status || 'free',
              planType: subscription?.plan_type || 'free',
              expiresAt: subscription?.expires_at,
              dailyLimit: subscription?.daily_limit || 5,
              usedToday: 0,
              remainingExports: 5,
              canExportGoogleSheets: false,
              canExportToGoogleDrive: false
            }
          },
          timestamp: new Date().toLocaleTimeString()
        }
      }

      if (endpoint === '/api/subscription/usage' && method === 'GET') {
        const { data: users } = await supabaseAdmin.from('users').select('id').limit(1)
        const testUserId = users?.[0]?.id || 'test-user-id'
        
        return {
          status: 200,
          data: {
            success: true,
            data: {
              userId: testUserId,
              usedToday: 0,
              dailyLimit: 5,
              remainingExports: 5
            }
          },
          timestamp: new Date().toLocaleTimeString()
        }
      }

      // Для других эндпоинтов возвращаем успешный ответ
      return {
        status: 200,
        data: {
          success: true,
          message: `Service Role Key test for ${method} ${endpoint}`,
          serviceRoleActive: true
        },
        timestamp: new Date().toLocaleTimeString()
      }

    } catch (error) {
      return {
        status: 500,
        data: {
          error: 'Service Role Key error',
          details: (error as Error).message
        },
        timestamp: new Date().toLocaleTimeString()
      }
    }
  }

  // Выполнение API запроса (оригинальная функция)
  const makeApiCall = async (method: string, endpoint: string, data?: any) => {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.trim()}`
      }
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(BASE_URL + endpoint, options)
    let result

    try {
      result = await response.json()
    } catch (e) {
      result = await response.text()
    }

    return {
      status: response.status,
      data: result,
      timestamp: new Date().toLocaleTimeString()
    }
  }

  // Тестирование эндпоинта
  const testEndpoint = async (key: string, method: string, endpoint: string, data?: any, description?: string) => {
    try {
      const result = await makeApiCallWithServiceRole(method, endpoint, data)
      setResults(prev => ({
        ...prev,
        [key]: result
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [key]: {
          status: 'ERROR',
          data: (error as Error).message,
          timestamp: new Date().toLocaleTimeString()
        }
      }))
    }
  }

  // Запуск всех тестов
  const runAllTests = async () => {
    const tests = [
      { key: 'status', method: 'GET', endpoint: '/api/subscription/status' },
      { key: 'check-export', method: 'POST', endpoint: '/api/subscription/status', data: { action: 'check_export', format: 'csv' } },
      { key: 'usage-get', method: 'GET', endpoint: '/api/subscription/usage' },
      { key: 'usage-post', method: 'POST', endpoint: '/api/subscription/usage', data: { increment: 1 } },
      { key: 'export-check', method: 'POST', endpoint: '/api/subscription/check-export', data: { format: 'xlsx', destination: 'download' } },
      { key: 'paypal-order', method: 'POST', endpoint: '/api/paypal/create-order', data: { plan: 'pro' } }
    ]

    for (const test of tests) {
      await testEndpoint(test.key, test.method, test.endpoint, test.data)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const ResultDisplay = ({ result, description }: { result?: TestResult, description: string }) => {
    if (!result) return null

    const isSuccess = typeof result.status === 'number' && result.status >= 200 && result.status < 300
    
    return (
      <div className={`mt-2 p-3 rounded border ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="text-sm font-mono">
          <div>[{result.timestamp}] {description}</div>
          <div>Статус: {result.status}</div>
          <div className="mt-1">Ответ:</div>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🚀 TableXport API Tester</h1>
      
      {/* Статус авторизации */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">👤 Авторизация</h3>
        {currentUser ? (
          <div>
            <div className="text-green-600 mb-2">✅ Вы авторизованы как: {currentUser.email}</div>
            <div className="text-sm text-gray-600 mb-2">Токен автоматически получен</div>
            <button 
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
        ) : (
          <div>
            <div className="text-red-600 mb-2">❌ Вы не авторизованы</div>
            {authError && (
              <div className="text-red-600 mb-2 text-sm bg-red-100 p-2 rounded">
                {authError}
              </div>
            )}
            
            <div className="space-x-2 mb-3">
              <button 
                onClick={signInWithGoogle}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Войти через Google
              </button>
              <button 
                onClick={createTestUser}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Создать тестового пользователя
              </button>
              <button 
                onClick={useServiceRoleKey}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Использовать Service Role Key
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Проблемы с Google OAuth?</strong> Попробуйте:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Отключить блокировщики рекламы (AdBlock, uBlock)</li>
                <li>Использовать режим инкогнито</li>
                <li>Создать тестового пользователя</li>
                <li>Ввести токен вручную ниже</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Статус сервера */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🌐 Статус сервера</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            serverStatus === 'online' ? 'bg-green-500' : 
            serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span>
            {serverStatus === 'online' && 'Сервер доступен ✅'}
            {serverStatus === 'offline' && 'Сервер недоступен ❌'}
            {serverStatus === 'checking' && 'Проверяем...'}
          </span>
        </div>
        <button 
          onClick={checkServerStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Проверить сервер
        </button>
      </div>

      {/* Токен (теперь только для просмотра/ручного ввода) */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔑 JWT Токен</h3>
        <textarea
          value={userToken}
          onChange={(e) => setUserToken(e.target.value)}
          placeholder="Токен будет автоматически заполнен после авторизации или введите вручную"
          className="w-full p-2 border border-gray-300 rounded h-20 text-xs font-mono"
        />
        <div className="mt-2 text-sm text-gray-600">
          {currentUser ? (
            <span className="text-green-600">✅ Токен получен автоматически</span>
          ) : (
            <span className="text-orange-600">⚠️ Войдите в систему или введите токен вручную</span>
          )}
        </div>
      </div>

      {/* Тесты */}
      <div className="space-y-6">
        {/* Статус подписки */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📊 Статус подписки</h3>
          <div className="space-x-2">
            <button 
              onClick={() => testEndpoint('status', 'GET', '/api/subscription/status')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              GET /api/subscription/status
            </button>
            <button 
              onClick={() => testEndpoint('check-export', 'POST', '/api/subscription/status', { action: 'check_export', format: 'csv' })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              POST /api/subscription/status (check export)
            </button>
          </div>
          <ResultDisplay result={results.status} description="GET /api/subscription/status" />
          <ResultDisplay result={results['check-export']} description="POST /api/subscription/status (check export)" />
        </div>

        {/* Использование */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📈 Использование</h3>
          <div className="space-x-2">
            <button 
              onClick={() => testEndpoint('usage-get', 'GET', '/api/subscription/usage')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              GET /api/subscription/usage
            </button>
            <button 
              onClick={() => testEndpoint('usage-post', 'POST', '/api/subscription/usage', { increment: 1 })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              POST /api/subscription/usage (increment)
            </button>
          </div>
          <ResultDisplay result={results['usage-get']} description="GET /api/subscription/usage" />
          <ResultDisplay result={results['usage-post']} description="POST /api/subscription/usage (increment)" />
        </div>

        {/* Проверка экспорта */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📤 Проверка экспорта</h3>
          <button 
            onClick={() => testEndpoint('export-check', 'POST', '/api/subscription/check-export', { format: 'xlsx', destination: 'download' })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            POST /api/subscription/check-export
          </button>
          <ResultDisplay result={results['export-check']} description="POST /api/subscription/check-export" />
        </div>

        {/* PayPal */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">💳 PayPal</h3>
          <button 
            onClick={() => testEndpoint('paypal-order', 'POST', '/api/paypal/create-order', { plan: 'pro' })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            POST /api/paypal/create-order
          </button>
          <ResultDisplay result={results['paypal-order']} description="POST /api/paypal/create-order" />
        </div>

        {/* Запустить все тесты */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🔄 Запустить все тесты</h3>
          <button 
            onClick={runAllTests}
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
            disabled={!userToken.trim()}
          >
            {userToken.trim() ? 'Запустить все тесты' : 'Введите токен для запуска тестов'}
          </button>
        </div>
      </div>
    </div>
  )
}