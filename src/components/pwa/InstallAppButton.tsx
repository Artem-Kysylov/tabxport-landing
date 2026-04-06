'use client';

import React, { useState, useEffect } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { BeforeInstallPromptEvent } from '@/types/pwa';
import { cn } from '@/lib/utils';

const detectIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const maxTouchPoints = window.navigator.maxTouchPoints;

  const isIOSUserAgent = /iPhone|iPad|iPod/.test(userAgent);
  const isIPadOS = platform === 'MacIntel' && maxTouchPoints > 1;

  return isIOSUserAgent || isIPadOS;
};

interface InstallAppButtonProps {
  className?: string;
  label?: React.ReactNode;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  className,
  label = 'Install App',
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsIOS(detectIOSDevice());

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (isInstalled) {
      return;
    }

    if (isIOS) {
      setShowPrompt(true);
      return;
    }

    if (deferredPrompt) {
      const nativePrompt = deferredPrompt;
      setDeferredPrompt(null);
      await nativePrompt.prompt();
      const choiceResult = await nativePrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      return;
    }

    if (isIOS) {
      setShowPrompt(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={cn('transition-colors duration-300 ease-in-out hover:text-primary cursor-pointer', className)}
        type='button'
      >
        {label}
      </button>
      <PWAInstallPrompt 
        trigger={showPrompt}
        forceShow={true}
        onClose={() => setShowPrompt(false)} 
      />
    </>
  );
};
