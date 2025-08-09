import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscriptionStatus, canUserExport, incrementDailyUsage } from '@/lib/subscription/subscription-utils'

// GET - Проверка статуса подписки
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

    // Получаем статус подписки
    const subscription = await getUserSubscriptionStatus(user.id, true)
    
    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        status: subscription.status,
        planType: subscription.planType,
        expiresAt: subscription.expiresAt,
        dailyLimit: subscription.dailyLimit,
        usedToday: subscription.usedToday,
        remainingExports: subscription.dailyLimit === -1 ? -1 : Math.max(0, subscription.dailyLimit - subscription.usedToday),
        canExportGoogleSheets: subscription.canExportGoogleSheets,
        canExportToGoogleDrive: subscription.canExportToGoogleDrive
      }
    })

  } catch (error) {
    console.error('Error getting subscription status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Проверка возможности экспорта (с опциональным инкрементом)
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
    const { 
      exportType = 'standard', 
      incrementUsage = false,
      checkOnly = false 
    } = body

    // Проверяем возможность экспорта
    const exportCheck = await canUserExport(user.id, exportType)
    
    if (!exportCheck.canExport) {
      return NextResponse.json({
        success: false,
        canExport: false,
        reason: exportCheck.reason,
        remainingExports: exportCheck.remainingExports
      })
    }

    // Если нужно только проверить без инкремента
    if (checkOnly) {
      return NextResponse.json({
        success: true,
        canExport: true,
        remainingExports: exportCheck.remainingExports
      })
    }

    // Инкрементируем использование если запрошено
    if (incrementUsage) {
      const incrementSuccess = await incrementDailyUsage(user.id)
      
      if (!incrementSuccess) {
        return NextResponse.json(
          { error: 'Failed to update usage counter' },
          { status: 500 }
        )
      }

      // Получаем обновленный статус
      const updatedSubscription = await getUserSubscriptionStatus(user.id, true)
      
      return NextResponse.json({
        success: true,
        canExport: true,
        usageIncremented: true,
        remainingExports: updatedSubscription.dailyLimit === -1 ? -1 : Math.max(0, updatedSubscription.dailyLimit - updatedSubscription.usedToday)
      })
    }

    return NextResponse.json({
      success: true,
      canExport: true,
      remainingExports: exportCheck.remainingExports
    })

  } catch (error) {
    console.error('Error checking export permission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}