import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/payment?source=landing'

  // Детальное логирование для отладки
  console.log('Auth callback called:', {
    hasCode: !!code,
    code: code ? `${code.substring(0, 10)}...` : null,
    next,
    origin,
    allParams: Object.fromEntries(searchParams.entries()),
    fullUrl: request.url
  })

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('OAuth exchange result:', { 
        success: !error,
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        error: error?.message,
        errorDetails: error
      })
      
      if (!error && data?.session) {
        const redirectUrl = `${origin}${next}`
        console.log('SUCCESS: Redirecting to:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.log('FAILED: Exchange failed, redirecting to home')
        console.log('Error details:', error)
      }
    } catch (exception) {
      console.error('EXCEPTION in exchange:', exception)
    }
  } else {
    console.log('No code parameter - redirecting to home')
  }

  console.log('FALLBACK: Redirecting to home')
  return NextResponse.redirect(`${origin}/`)
}