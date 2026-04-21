'use client';

import React, { useState, useEffect } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { cn } from '@/lib/utils';
import {
  attachGlobalInstallPromptListeners,
  triggerNativeInstallPrompt,
} from '@/lib/pwa/deferredInstallPromptStore';

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

  useEffect(() => {
    attachGlobalInstallPromptListeners();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsIOS(detectIOSDevice());

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
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

    const { outcome } = await triggerNativeInstallPrompt();

    if (outcome === 'accepted') {
      setIsInstalled(true);
      return;
    }

    if (outcome === 'dismissed') {
      return;
    }

    setShowPrompt(true);
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
