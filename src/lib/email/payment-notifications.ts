import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class PaymentNotifications {
  static async sendPaymentConfirmation(
    userEmail: string,
    paymentData: {
      amount: number
      currency: string
      plan: string
      orderId: string
      date: Date
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: userEmail,
        replyTo: process.env.RESEND_REPLY_TO || 'tabxport@gmail.com',
        subject: 'Payment processed successfully - TabXport Pro',
        html: this.generatePaymentEmailTemplate(paymentData)
      })
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error)
    }
  }

  static async sendSubscriptionActivated(
    userEmail: string,
    subscriptionData: {
      plan: string
      expiresAt: Date
      subscriptionId: string
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: userEmail,
        replyTo: process.env.RESEND_REPLY_TO || 'tabxport@gmail.com',
        subject: 'Your TabXport Pro subscription is active',
        html: `
          <h1>Subscription Activated</h1>
          <p>Your TabXport Pro subscription is now active.</p>
          <ul>
            <li>Plan: ${subscriptionData.plan}</li>
            <li>Valid until: ${subscriptionData.expiresAt.toLocaleDateString('en-US')}</li>
            <li>Subscription ID: ${subscriptionData.subscriptionId}</li>
          </ul>
          <p>You can now use all TabXport Pro features.</p>
        `
      })
    } catch (error) {
      console.error('Failed to send subscription activated email:', error)
    }
  }

  static async sendPaymentFailed(
    userEmail: string,
    errorData: {
      orderId: string
      amount: number
      currency: string
      errorMessage?: string
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: userEmail,
        replyTo: process.env.RESEND_REPLY_TO || 'tabxport@gmail.com',
        subject: 'There was a problem with your payment - TabXport Pro',
        html: `
          <h1>Payment Issue</h1>
          <p>Unfortunately, we couldn't process your payment:</p>
          <ul>
            <li>Amount: ${errorData.amount} ${errorData.currency}</li>
            <li>Order ID: ${errorData.orderId}</li>
            ${errorData.errorMessage ? `<li>Reason: ${errorData.errorMessage}</li>` : ''}
          </ul>
          <p>Please verify your payment details and try again, or contact support.</p>
        `
      })
    } catch (error) {
      console.error('Failed to send payment failed email:', error)
    }
  }

  static async sendAdminPaymentSuccess(
    adminEmail: string,
    data: {
      userEmail: string
      amount: number
      currency: string
      orderId: string
      paymentId?: string
      plan?: string
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: adminEmail,
        replyTo: process.env.RESEND_REPLY_TO || 'tabxport@gmail.com',
        subject: `💰 Successful payment ${data.amount} ${data.currency}`,
        html: `
          <h1>💰 Successful Payment</h1>
          <ul>
            <li><strong>User:</strong> ${data.userEmail}</li>
            <li><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
            <li><strong>Plan:</strong> ${data.plan ?? '-'}</li>
            <li><strong>Order ID:</strong> ${data.orderId}</li>
            <li><strong>Payment ID:</strong> ${data.paymentId ?? '-'}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString('en-US')}</li>
          </ul>
        `
      })
    } catch (error) {
      console.error('Failed to send admin success email:', error)
    }
  }

  static async sendAdminPaymentFailed(
    adminEmail: string,
    data: {
      userEmail?: string
      amount?: number
      currency?: string
      orderId?: string
      paymentId?: string
      reason?: string
    }
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: adminEmail,
        replyTo: process.env.RESEND_REPLY_TO || 'tabxport@gmail.com',
        subject: `❌ Payment failed ${data.amount ? `${data.amount} ${data.currency}` : ''}`,
        html: `
          <h1>❌ Payment Failed</h1>
          <ul>
            <li><strong>User:</strong> ${data.userEmail ?? '-'}</li>
            <li><strong>Amount:</strong> ${data.amount ?? '-'} ${data.currency ?? ''}</li>
            <li><strong>Order ID:</strong> ${data.orderId ?? '-'}</li>
            <li><strong>Payment ID:</strong> ${data.paymentId ?? '-'}</li>
            <li><strong>Reason:</strong> ${data.reason ?? '-'}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString('en-US')}</li>
          </ul>
        `
      })
    } catch (error) {
      console.error('Failed to send admin failed email:', error)
    }
  }

  private static generatePaymentEmailTemplate(paymentData: any): string {
    return `
      <h1>Thank you for your purchase!</h1>
      <p>Your payment has been processed:</p>
      <ul>
        <li>Amount: ${paymentData.amount} ${paymentData.currency}</li>
        <li>Plan: ${paymentData.plan}</li>
        <li>Order ID: ${paymentData.orderId}</li>
        <li>Date: ${paymentData.date.toLocaleDateString('en-US')}</li>
      </ul>
      <p>Your subscription is now active.</p>
    `
  }
}