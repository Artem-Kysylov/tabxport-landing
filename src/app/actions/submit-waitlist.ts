'use server'

import { createClient } from '@/lib/supabase/server'

type SubmitToWaitlistResult =
  | { success: true }
  | { error: string }

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function submitToWaitlist(formData: FormData): Promise<SubmitToWaitlistResult> {
  const rawEmail = formData.get('email')

  if (typeof rawEmail !== 'string') {
    return { error: 'Please enter a valid email.' }
  }

  const email = rawEmail.trim().toLowerCase()

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email.' }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('syntax_waitlist')
      .insert({
        email,
        project: 'prompt-builder',
        source: 'landing-section',
      })

    if (error) {
      if (error.code === '23505') {
        return { success: true }
      }

      return { error: error.message || 'Something went wrong. Please try again.' }
    }

    return { success: true }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}
