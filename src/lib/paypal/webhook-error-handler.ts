// Система обработки ошибок webhook'ов
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface WebhookError {
  event_id: string
  error_type: 'validation' | 'processing' | 'database' | 'network'
  error_message: string
  retry_count: number
  max_retries: number
  next_retry_at?: Date
}

export class WebhookErrorHandler {
  private static MAX_RETRIES = 3
  private static RETRY_DELAYS = [1000, 5000, 15000] // 1s, 5s, 15s

  static async handleError(
    eventId: string,
    error: Error,
    errorType: WebhookError['error_type']
  ): Promise<void> {
    // Логируем ошибку в базу данных
    await supabaseAdmin
      .from('webhook_errors')
      .insert({
        event_id: eventId,
        error_type: errorType,
        error_message: error.message,
        retry_count: 0,
        max_retries: this.MAX_RETRIES,
        next_retry_at: new Date(Date.now() + this.RETRY_DELAYS[0])
      })

    // Отправляем уведомление администратору
    await this.notifyAdmin(eventId, error, errorType)
  }

  static async retryFailedWebhook(eventId: string): Promise<boolean> {
    // Логика повторной обработки
    // Увеличиваем счетчик попыток
    // Планируем следующую попытку
    return true
  }

  private static async notifyAdmin(
    eventId: string,
    error: Error,
    errorType: string
  ): Promise<void> {
    // Отправка email или Slack уведомления
    console.error(`Webhook Error [${errorType}]: ${eventId} - ${error.message}`)
  }
}