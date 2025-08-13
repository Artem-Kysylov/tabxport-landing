import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Защищенные роуты, требующие аутентификации
const protectedRoutes = [
  '/payment',
  '/success',
  '/api/subscription',
  '/api/paypal/create-order',
  '/api/paypal/capture-order'
]

// Роуты, требующие Pro подписку
const proOnlyRoutes = [
  '/api/subscription/pro-features'
]

// Публичные API роуты (webhooks и т.д.)
const publicApiRoutes = [
  '/api/paypal/webhooks'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Админ-маршруты (страницы и API)
  const adminRoutes = ['/admin', '/api/admin']
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('auth', 'required')
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      const adminEmails = ['tabxport@gmail.com']
      if (!adminEmails.includes(user.email || '')) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (e) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Пропускаем публичные API роуты
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Проверяем защищенные роуты
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProOnlyRoute = proOnlyRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute || isProOnlyRoute) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      // Если пользователь не аутентифицирован
      if (error || !user) {
        // Для API роутов возвращаем 401
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }

        // Для страниц перенаправляем на главную с параметром для авторизации
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('auth', 'required')
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // НОВАЯ ЛОГИКА: Если пользователь авторизован и пытается попасть на success page
      if (pathname === '/success' && user) {
        // Разрешаем доступ для всех авторизованных пользователей
        return NextResponse.next()
      }

      // Для Pro-only роутов проверяем подписку
      if (isProOnlyRoute) {
        const subscriptionCheck = await checkUserSubscription(user.id)
        
        if (!subscriptionCheck.isPro) {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { 
                error: 'Pro subscription required',
                subscriptionStatus: subscriptionCheck.status
              },
              { status: 403 }
            )
          }

          // Перенаправляем на страницу оплаты
          const redirectUrl = new URL('/payment', request.url)
          redirectUrl.searchParams.set('upgrade', 'required')
          return NextResponse.redirect(redirectUrl)
        }
      }

      // Добавляем заголовки с информацией о пользователе для API роутов
      if (pathname.startsWith('/api/')) {
        const response = NextResponse.next()
        response.headers.set('x-user-id', user.id)
        response.headers.set('x-user-email', user.email || '')
        return response
      }

    } catch (error) {
      console.error('Middleware error:', error)
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }

      // При ошибке перенаправляем на главную
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Специальная логика для страницы оплаты
  if (pathname === '/payment') {
    return handlePaymentPageAccess(request)
  }

  return NextResponse.next()
}

// Проверка подписки пользователя
async function checkUserSubscription(userId: string): Promise<{
  isPro: boolean
  status: string
  expiresAt?: string
}> {
  try {
    // Импортируем функцию проверки подписки
    const { getUserSubscriptionStatus } = await import('@/lib/subscription/subscription-utils')
    const subscription = await getUserSubscriptionStatus(userId, true)
    
    return {
      isPro: subscription.status === 'pro',
      status: subscription.status,
      expiresAt: subscription.expiresAt || undefined
    }
  } catch (error) {
    console.error('Error checking subscription:', error)
    return {
      isPro: false,
      status: 'error'
    }
  }
}

// Обработка доступа к странице оплаты
async function handlePaymentPageAccess(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const source = searchParams.get('source')

  // Если пользователь пришел из расширения, проверяем аутентификацию
  if (source === 'extension') {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        // Перенаправляем на авторизацию с сохранением source
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('auth', 'required')
        redirectUrl.searchParams.set('source', 'extension')
        redirectUrl.searchParams.set('redirect', '/payment')
        return NextResponse.redirect(redirectUrl)
      }

      // Проверяем, не является ли пользователь уже Pro
      const subscriptionCheck = await checkUserSubscription(user.id)
      if (subscriptionCheck.isPro) {
        // Перенаправляем на success страницу
        const redirectUrl = new URL('/success', request.url)
        redirectUrl.searchParams.set('already_pro', 'true')
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Error in payment page access check:', error)
    }
  }

  return NextResponse.next()
}

// Конфигурация matcher для определения, на каких путях запускать middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}