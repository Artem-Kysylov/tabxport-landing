import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/payment?source=landing'

  // Логирование для отладки
  console.log('Auth callback called:', {
    hasCode: !!code,
    next,
    origin,
    allParams: Object.fromEntries(searchParams.entries()),
    fullUrl: request.url
  })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('OAuth exchange result:', { 
      success: !error, 
      error: error?.message 
    })
    
    if (!error) {
      const redirectUrl = `${origin}${next}`
      console.log('Redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }
  }

  console.log('No code parameter - redirecting to home')
  return NextResponse.redirect(`${origin}/`)
}