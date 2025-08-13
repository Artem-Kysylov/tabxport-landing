import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/payment?source=landing'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Успешная авторизация - перенаправляем на нужную страницу
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Если что-то пошло не так, перенаправляем на главную
  return NextResponse.redirect(`${origin}/`)
}