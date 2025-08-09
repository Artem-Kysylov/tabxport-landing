import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incrementDailyUsage, getUserSubscriptionStatus } from '@/lib/subscription/subscription-utils'

// POST - Инкремент счетчика использования
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Получаем пользователя из сессии
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { exportType = 'standard' } = body

    // Проверяем, может ли пользователь экспортировать
    const subscription = await getUserSubscriptionStatus(user.id, true)
    
    // Для Pro пользователей не ограничиваем
    if (subscription.status === 'pro') {
      return NextResponse.json({
        success: true,
        unlimited: true,
        status: subscription.status
      })
    }

    // Для Free пользователей проверяем лимиты
    if (subscription.usedToday >= subscription.dailyLimit) {
      return NextResponse.json({
        success: false,
        error: 'Daily limit exceeded',
        usedToday: subscription.usedToday,
        dailyLimit: subscription.dailyLimit
      }, { status: 429 })
    }

    // Инкрементируем использование
    const incrementSuccess = await incrementDailyUsage(user.id)
    
    if (!incrementSuccess) {
      return NextResponse.json(
        { error: 'Failed to update usage counter' },
        { status: 500 }
      )
    }

    // Возвращаем обновленную информацию
    const updatedSubscription = await getUserSubscriptionStatus(user.id, true)
    
    return NextResponse.json({
      success: true,
      usedToday: updatedSubscription.usedToday,
      dailyLimit: updatedSubscription.dailyLimit,
      remainingExports: Math.max(0, updatedSubscription.dailyLimit - updatedSubscription.usedToday)
    })

  } catch (error) {
    console.error('Error incrementing usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Получение текущего использования
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Получаем пользователя из сессии
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscription = await getUserSubscriptionStatus(user.id, true)
    
    return NextResponse.json({
      success: true,
      data: {
        usedToday: subscription.usedToday,
        dailyLimit: subscription.dailyLimit,
        remainingExports: subscription.dailyLimit === -1 ? -1 : Math.max(0, subscription.dailyLimit - subscription.usedToday),
        status: subscription.status
      }
    })

  } catch (error) {
    console.error('Error getting usage info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}