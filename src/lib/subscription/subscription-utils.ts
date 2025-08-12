import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBrowser } from '@/lib/supabase/client'

type SubscriptionStatus = 'free' | 'pro' | 'expired' | 'cancelled'

interface UserSubscription {
  status: SubscriptionStatus
  planType: string | null
  expiresAt: string | null
  dailyLimit: number
  usedToday: number
  canExportGoogleSheets: boolean
  canExportToGoogleDrive: boolean
}

interface DailyUsage {
  date: string
  count: number
  userId: string
}

// Проверка статуса подписки пользователя
export async function getUserSubscriptionStatus(userId: string, isServer = false): Promise<UserSubscription> {
  const supabase = isServer ? await createClient() : createClientBrowser()
  
  try {
    // Получаем активную подписку
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching subscription:', subError)
    }

    // Получаем использование за сегодня
    const today = new Date().toISOString().split('T')[0]
    const { data: usage, error: usageError } = await supabase
      .from('daily_limits')
      .select('exports_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching daily usage:', usageError)
    }

    // Определяем статус подписки
    let status: SubscriptionStatus = 'free'
    let planType: string | null = null
    let expiresAt: string | null = null
    let dailyLimit = 5 // Free план
    let canExportGoogleSheets = false
    let canExportToGoogleDrive = false

    if (subscription) {
      const now = new Date()
      const subscriptionEnd = new Date(subscription.current_period_end)
      
      if (subscriptionEnd > now) {
        status = 'pro'
        planType = subscription.plan_type
        expiresAt = subscription.current_period_end
        dailyLimit = -1 // Unlimited
        canExportGoogleSheets = true
        canExportToGoogleDrive = true
      } else {
        status = 'expired'
        planType = subscription.plan_type
        expiresAt = subscription.current_period_end
      }
    }

    return {
      status,
      planType,
      expiresAt,
      dailyLimit,
      usedToday: usage?.exports_count || 0,
      canExportGoogleSheets,
      canExportToGoogleDrive
    }
  } catch (error) {
    console.error('Error in getUserSubscriptionStatus:', error)
    // Возвращаем безопасные значения по умолчанию
    return {
      status: 'free',
      planType: null,
      expiresAt: null,
      dailyLimit: 5,
      usedToday: 0,
      canExportGoogleSheets: false,
      canExportToGoogleDrive: false
    }
  }
}

// Проверка, может ли пользователь экспортировать
export async function canUserExport(userId: string, exportType: 'standard' | 'google_sheets' = 'standard'): Promise<{
  canExport: boolean
  reason?: string
  remainingExports?: number
}> {
  const subscription = await getUserSubscriptionStatus(userId)

  // Проверка для Google Sheets
  if (exportType === 'google_sheets' && !subscription.canExportGoogleSheets) {
    return {
      canExport: false,
      reason: 'Google Sheets export requires Pro subscription'
    }
  }

  // Проверка лимитов для Free плана
  if (subscription.status === 'free') {
    if (subscription.usedToday >= subscription.dailyLimit) {
      return {
        canExport: false,
        reason: 'Daily export limit reached. Upgrade to Pro for unlimited exports.'
      }
    }
    
    return {
      canExport: true,
      remainingExports: subscription.dailyLimit - subscription.usedToday
    }
  }

  // Pro план - неограниченно
  if (subscription.status === 'pro') {
    return {
      canExport: true
    }
  }

  // Expired или cancelled
  return {
    canExport: false,
    reason: 'Subscription expired. Please renew your Pro subscription.'
  }
}

// Обновление счётчика использования
export async function incrementDailyUsage(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  try {
    // Пытаемся обновить существующую запись
    const { data: existing, error: fetchError } = await supabase
      .from('daily_limits')
      .select('exports_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching daily usage:', fetchError)
      return false
    }

    if (existing) {
      // Обновляем существующую запись
      const { error: updateError } = await supabase
        .from('daily_limits')
        .update({ exports_count: existing.exports_count + 1 })
        .eq('user_id', userId)
        .eq('date', today)

      if (updateError) {
        console.error('Error updating daily usage:', updateError)
        return false
      }
    } else {
      // Создаём новую запись
      const { error: insertError } = await supabase
        .from('daily_limits')
        .insert({
          user_id: userId,
          date: today,
          exports_count: 1
        })

      if (insertError) {
        console.error('Error inserting daily usage:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in incrementDailyUsage:', error)
    return false
  }
}

// Создание или обновление подписки
export async function createOrUpdateSubscription(
  userId: string,
  paypalSubscriptionId: string,
  planType: string,
  status: 'active' | 'cancelled' | 'expired' = 'active'
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    const subscriptionData = {
      user_id: userId,
      paypal_subscription_id: paypalSubscriptionId,
      plan_type: planType,
      status,
      current_period_start: now.toISOString(),
      current_period_end: nextMonth.toISOString(),
      updated_at: now.toISOString()
    }

    // Проверяем, есть ли уже подписка
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Обновляем существующую
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating subscription:', error)
        return false
      }
    } else {
      // Создаём новую
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscriptionData,
          created_at: now.toISOString()
        })

      if (error) {
        console.error('Error creating subscription:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in createOrUpdateSubscription:', error)
    return false
  }
}

// Отмена подписки
export async function cancelSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error cancelling subscription:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in cancelSubscription:', error)
    return false
  }
}