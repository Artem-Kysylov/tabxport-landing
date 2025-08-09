import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export interface AuthResult {
  isAuthenticated: boolean
  user?: {
    id: string
    email: string
  }
  error?: string
}

export interface SubscriptionResult {
  isPro: boolean
  status: 'free' | 'pro' | 'expired' | 'cancelled'
  expiresAt?: string
  canAccess: boolean
}

// Проверка аутентификации пользователя
export async function checkAuthentication(request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        isAuthenticated: false,
        error: error?.message || 'User not authenticated'
      }
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email || ''
      }
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Authentication check failed'
    }
  }
}

// Проверка подписки и доступа
export async function checkSubscriptionAccess(userId: string): Promise<SubscriptionResult> {
  try {
    const { getUserSubscriptionStatus } = await import('@/lib/subscription/subscription-utils')
    const subscription = await getUserSubscriptionStatus(userId, true)
    
    const isPro = subscription.status === 'pro'
    const canAccess = isPro || subscription.status === 'free' // Free пользователи тоже имеют базовый доступ
    
    return {
      isPro,
      status: subscription.status,
      expiresAt: subscription.expiresAt || undefined,
      canAccess
    }
  } catch (error) {
    console.error('Error checking subscription access:', error)
    return {
      isPro: false,
      status: 'free',
      canAccess: true // По умолчанию даем базовый доступ
    }
  }
}

// Проверка rate limiting для API
export async function checkRateLimit(userId: string, endpoint: string): Promise<{
  allowed: boolean
  remaining?: number
  resetTime?: number
}> {
  // Простая реализация rate limiting
  // В production можно использовать Redis или другое решение
  
  try {
    const { getUserSubscriptionStatus } = await import('@/lib/subscription/subscription-utils')
    const subscription = await getUserSubscriptionStatus(userId, true)
    
    // Pro пользователи имеют более высокие лимиты
    if (subscription.status === 'pro') {
      return { allowed: true }
    }
    
    // Для Free пользователей проверяем дневные лимиты
    const remaining = Math.max(0, subscription.dailyLimit - subscription.usedToday)
    
    return {
      allowed: remaining > 0,
      remaining,
      resetTime: getNextMidnight()
    }
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return { allowed: false }
  }
}

// Получение времени до следующей полуночи (сброс лимитов)
function getNextMidnight(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

// Логирование доступа для аудита
export async function logAccess(userId: string, endpoint: string, success: boolean, metadata?: any) {
  try {
    // В production здесь можно логировать в базу данных или внешний сервис
    console.log('Access log:', {
      userId,
      endpoint,
      success,
      timestamp: new Date().toISOString(),
      metadata
    })
  } catch (error) {
    console.error('Error logging access:', error)
  }
}