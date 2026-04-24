'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface GoogleAuthButtonProps {
  children: React.ReactNode
  redirectTo?: string
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export default function GoogleAuthButton({ 
  children, 
  redirectTo = '/',
  className = '',
  variant = 'default'
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true)
      
      const baseUrl = window.location.origin
      const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      
      console.log('Google Auth Config:', {
        redirectTo: redirectUrl,
        baseUrl,
        origin: window.location.origin,
        location: window.location.href,
        hostname: window.location.hostname,
      })
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          scopes: 'https://www.googleapis.com/auth/drive.file'
        }
      })

      if (error) {
        console.error('Auth error:', error)
      }
    } catch (error) {
      console.error('Auth exception:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleGoogleAuth}
      disabled={isLoading}
      variant={variant}
      className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Авторизация...' : children}
    </Button>
  )
}
