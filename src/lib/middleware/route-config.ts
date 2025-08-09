export interface RouteConfig {
  path: string
  requiresAuth: boolean
  requiresPro: boolean
  rateLimit?: {
    requests: number
    window: number // в секундах
  }
  allowedMethods?: string[]
}

export const routeConfigs: RouteConfig[] = [
  // Страницы
  {
    path: '/payment',
    requiresAuth: true,
    requiresPro: false
  },
  {
    path: '/success',
    requiresAuth: true,
    requiresPro: false
  },
  
  // API эндпоинты - общие
  {
    path: '/api/subscription/status',
    requiresAuth: true,
    requiresPro: false,
    rateLimit: { requests: 60, window: 60 }, // 60 запросов в минуту
    allowedMethods: ['GET', 'POST']
  },
  {
    path: '/api/subscription/usage',
    requiresAuth: true,
    requiresPro: false,
    rateLimit: { requests: 100, window: 60 },
    allowedMethods: ['GET', 'POST']
  },
  {
    path: '/api/subscription/check-export',
    requiresAuth: true,
    requiresPro: false,
    rateLimit: { requests: 200, window: 60 },
    allowedMethods: ['POST']
  },
  
  // API эндпоинты - PayPal
  {
    path: '/api/paypal/create-order',
    requiresAuth: true,
    requiresPro: false,
    rateLimit: { requests: 10, window: 60 }, // Ограничиваем создание заказов
    allowedMethods: ['POST']
  },
  {
    path: '/api/paypal/capture-order',
    requiresAuth: true,
    requiresPro: false,
    rateLimit: { requests: 10, window: 60 },
    allowedMethods: ['POST']
  },
  
  // Webhooks - публичные
  {
    path: '/api/paypal/webhooks',
    requiresAuth: false,
    requiresPro: false,
    allowedMethods: ['POST']
  },
  
  // Pro-only эндпоинты (для будущих функций)
  {
    path: '/api/subscription/pro-features',
    requiresAuth: true,
    requiresPro: true,
    rateLimit: { requests: 1000, window: 60 },
    allowedMethods: ['GET', 'POST']
  }
]

export function getRouteConfig(pathname: string): RouteConfig | null {
  return routeConfigs.find(config => pathname.startsWith(config.path)) || null
}

export function isPublicRoute(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return !config || (!config.requiresAuth && !config.requiresPro)
}

export function requiresAuthentication(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return config ? config.requiresAuth : false
}

export function requiresProSubscription(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return config ? config.requiresPro : false
}