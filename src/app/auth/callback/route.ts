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

  // Вспомогательный рендер для вывода отладочной страницы в браузере
  const renderDebug = (title: string, details: Record<string, unknown>) => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 24px; line-height: 1.4; }
            pre { background: #0b1020; color: #e6edf3; padding: 16px; border-radius: 8px; overflow:auto; }
            a { color: #0ea5e9; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Это временная отладочная страница. Удалим после фикса.</p>
          <h3>Details</h3>
          <pre>${JSON.stringify(details, null, 2)}</pre>
          <p>
            <a href="${origin}/">Go Home</a> |
            <a href="${origin}${next}">Go Next (${next})</a>
          </p>
        </body>
      </html>
    `
    return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
  }

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
        console.log('FAILED: Exchange failed, showing debug page')
        return renderDebug('OAuth exchange failed', {
          request: {
            origin,
            next,
            hasCode: true,
            codeMasked: `${code.substring(0, 10)}...`,
            allParams: Object.fromEntries(searchParams.entries()),
            fullUrl: request.url
          },
          exchange: {
            success: !error,
            hasSession: !!data?.session,
            hasUser: !!data?.user,
            errorMessage: error?.message,
            error
          }
        })
      }
    } catch (exception) {
      console.error('EXCEPTION in exchange:', exception)
      return renderDebug('Exception during OAuth exchange', {
        request: {
          origin,
          next,
          hasCode: true,
          codeMasked: `${code.substring(0, 10)}...`,
          allParams: Object.fromEntries(searchParams.entries()),
          fullUrl: request.url
        },
        exception
      })
    }
  } else {
    console.log('No code parameter - showing debug page')
    return renderDebug('No code parameter', {
      request: {
        origin,
        next,
        hasCode: false,
        allParams: Object.fromEntries(searchParams.entries()),
        fullUrl: request.url
      }
    })
  }

  // На всякий случай общий фоллбек — тоже в виде отладочной страницы
  return renderDebug('Fallback reached', {
    info: 'Unexpected path reached in auth callback',
    origin,
    next,
    fullUrl: request.url
  })
  return NextResponse.redirect(`${origin}/`)
}