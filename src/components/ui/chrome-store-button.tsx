'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ChromeStoreButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function ChromeStoreButton({ 
  children = 'Install Chrome Extension',
  className = '',
  variant = 'default',
  size = 'default'
}: ChromeStoreButtonProps) {
  
  const handleInstall = () => {
    const chromeStoreUrl = process.env.NEXT_PUBLIC_CHROME_STORE_URL
    
    // Пока расширение не в сторе, показываем заглушку
    if (!chromeStoreUrl || chromeStoreUrl.includes('placeholder')) {
      alert('Extension is coming soon! We\'ll notify you when it\'s available in Chrome Web Store.')
      return
    }
    
    // Когда будет реальная ссылка
    window.open(chromeStoreUrl, '_blank')
  }

  return (
    <Button 
      onClick={handleInstall}
      variant={variant}
      size={size}
      className={`${className} flex items-center gap-2`}
    >
      <Image 
        src="/icon-chrome.svg"
        alt="Chrome Icon"
        width={20}
        height={20}
        className="flex-shrink-0"
      />
      {children}
    </Button>
  )
}