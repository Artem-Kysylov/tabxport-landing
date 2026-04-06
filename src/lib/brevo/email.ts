interface BrevoEmailParams {
  to: string
  templateId: number
  params?: Record<string, unknown>
}

interface BrevoResponse {
  messageId?: string
  error?: string
}

export async function sendBrevoEmail({
  to,
  templateId,
  params = {},
}: BrevoEmailParams): Promise<BrevoResponse> {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'TableXport',
          email: 'support@tablexport.com',
        },
        to: [
          {
            email: to,
          },
        ],
        templateId,
        params,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Brevo API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      )
    }

    const data = await response.json()
    return { messageId: data.messageId }
  } catch (error) {
    console.error('Failed to send email via Brevo:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
