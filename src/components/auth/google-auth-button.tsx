'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface GoogleAuthButtonProps {
  children: React.ReactNode
  redirectTo?: string
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export default function GoogleAuthButton({ 
  children, 
  redirectTo = '/payment?source=landing',
  className = '',
  variant = 'default'
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            redirect_uri: `${window.location.origin}/auth/callback` // Принудительно указываем
          }
        }
      })

      if (error) {
        console.error('Auth error:', error)
        // Можно добавить toast уведомление об ошибке
      }
    } catch (error) {
      console.error('Unexpected error:', error)
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
