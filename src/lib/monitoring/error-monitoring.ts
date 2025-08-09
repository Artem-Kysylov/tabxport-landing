import * as Sentry from '@sentry/nextjs'

export function initErrorMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV
    })
  }
}

export function capturePaymentError(error: Error, metadata: any) {
  Sentry.captureException(error, {
    tags: {
      type: 'payment_error'
    },
    extra: metadata
  })
}