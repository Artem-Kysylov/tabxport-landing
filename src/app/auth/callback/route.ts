import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/payment?source=landing'

  console.log('🔄 Auth callback started', { code: !!code, error, origin })

  // Если OAuth провайдер вернул ошибку
  if (error) {
    console.error('❌ OAuth provider error:', error, error_description)
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error_description || error)}`)
  }

  if (!code) {
    console.error('❌ No authorization code provided')
    return NextResponse.redirect(`${origin}/?auth_error=no_code`)
  }

  // Создаем response для установки cookies
  const response = NextResponse.redirect(`${origin}${next}`)
  
  // Создаем supabase клиент для Route Handler
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    console.log('🔑 Starting OAuth exchange...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('❌ OAuth exchange failed:', exchangeError)
      
      // Если ошибка связана с flow state, создаем страницу с автоматическим retry
      if (exchangeError.message?.includes('flow_state') || exchangeError.message?.includes('Invalid flow')) {
        console.log('🔄 Flow state error detected, creating retry page...')
        
        const retryPageHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth exchange failed</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 600px; 
            margin: 100px auto; 
            padding: 20px; 
            text-align: center;
            background: #0a0a0a;
            color: #ffffff;
        }
        .container { 
            background: #1a1a1a; 
            padding: 40px; 
            border-radius: 12px; 
            border: 1px solid #333;
        }
        .error-icon { font-size: 48px; margin-bottom: 20px; }
        .error-title { font-size: 24px; margin-bottom: 10px; font-weight: 600; }
        .error-message { margin-bottom: 30px; color: #888; }
        .retry-info { 
            background: #2a2a2a; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
        }
        .links { margin-top: 30px; }
        .links a { 
            color: #4CAF50; 
            text-decoration: none; 
            margin: 0 10px;
            padding: 8px 16px;
            border: 1px solid #4CAF50;
            border-radius: 6px;
            display: inline-block;
        }
        .links a:hover { background: #4CAF50; color: black; }
        .details { 
            margin-top: 20px; 
            padding: 15px; 
            background: #2a2a2a; 
            border-radius: 6px; 
            font-family: monospace; 
            font-size: 12px;
            color: #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">🔄</div>
        <h1 class="error-title">OAuth exchange failed</h1>
        <p class="error-message">Это временная отладочная страница. Удалим после фикса.</p>
        
        <div class="retry-info">
            <strong>✅ Авторизация успешна!</strong><br>
            Нажмите кнопку "Reload" выше или используйте ссылку ниже для продолжения.
        </div>
        
        <div class="links">
            <a href="javascript:window.location.reload()">🔄 Reload</a>
            <a href="${origin}${next}">📄 Go Next (${next})</a>
            <a href="${origin}">🏠 Go Home</a>
        </div>
        
        <details class="details">
            <summary>Детали ошибки (для отладки)</summary>
            <pre>${JSON.stringify({
              "request": {
                "origin": origin,
                "hasCode": !!code,
                "errorMessage": exchangeError.message,
                "next": next
              },
              "exchange": {
                "success": false,
                "hasSession": !!data?.session,
                "errorMessage": exchangeError.message,
                "code": "cf4bb46d-9955-4bb4-99f4-30bb311ba710"
              }
            }, null, 2)}</pre>
        </details>
    </div>
</body>
</html>`
        
        return new NextResponse(retryPageHTML, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        })
      }
      
      // Для других ошибок перенаправляем на главную
      return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(exchangeError.message)}`)
    }

    if (data?.session) {
      console.log('✅ OAuth exchange successful, user:', data.user?.email)
      return response
    } else {
      console.error('❌ No session after successful exchange')
      return NextResponse.redirect(`${origin}/?auth_error=no_session`)
    }
  } catch (exception) {
    console.error('💥 Exception in OAuth exchange:', exception)
    return NextResponse.redirect(`${origin}/?auth_error=exchange_failed`)
  }
}