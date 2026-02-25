import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Админ-маршруты (страницы и API)
  const adminRoutes = ['/admin', '/api/admin']
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('auth', 'required')
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      const adminEmails = ['tabxport@gmail.com']
      if (!adminEmails.includes(user.email || '')) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (e) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Конфигурация matcher для определения, на каких путях запускать middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}