'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import Image from 'next/image';
import { BeforeInstallPromptEvent } from '@/types/pwa';
import { IOSInstallSheet } from './IOSInstallSheet';

const detectIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const maxTouchPoints = window.navigator.maxTouchPoints;

  const isIOSUserAgent = /iPhone|iPad|iPod/.test(userAgent);
  const isIPadOS = platform === 'MacIntel' && maxTouchPoints > 1;

  return isIOSUserAgent || isIPadOS;
};

interface PWAInstallPromptProps {
  onClose?: () => void;
  trigger?: boolean;
  forceShow?: boolean;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose, trigger = false, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSSheet, setShowIOSSheet] = useState(false);

  const canShowCustomPrompt = isIOS || deferredPrompt !== null;

  const hidePrompt = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    setShowIOSSheet(false);
    try {
      localStorage.setItem('tx_pwa_prompt_dismissed', 'true');
    } catch {
      // ignore
    }
    onClose?.();
  };

  const handleInstall = async () => {
    const isIOSRuntime = detectIOSDevice();

    if (isIOSRuntime) {
      setIsVisible(false);
      setShowIOSSheet(true);
      return;
    }

    if (!deferredPrompt) {
      hidePrompt();
      return;
    }

    try {
      hidePrompt();
      const nativePrompt = deferredPrompt;
      setDeferredPrompt(null);
      await nativePrompt.prompt();
      const choiceResult = await nativePrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        try {
          localStorage.setItem('tx_pwa_installed', 'true');
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsIOS(detectIOSDevice());

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      try {
        localStorage.setItem('tx_pwa_installed', 'true');
      } catch (error) {
        console.error('Install state error:', error);
      }
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (trigger) {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const canOpenPrompt = isIOS || deferredPrompt !== null;
      
      // If forceShow is true (from footer button), ignore dismissed status
      if (forceShow) {
        if (!isStandalone && canOpenPrompt) {
          setIsVisible(true);
        }
      } else {
        // Normal flow - check dismissed status
        const isDismissed = localStorage.getItem('tx_pwa_prompt_dismissed') === 'true';
        if (!isStandalone && !isDismissed && canOpenPrompt) {
          setIsVisible(true);
        }
      }
    }
  }, [trigger, forceShow, isIOS, deferredPrompt]);

  return (
    <>
      {isVisible && canShowCustomPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 50,
            maxWidth: '380px',
            width: 'calc(100vw - 32px)',
          }}
        >
          <div
            style={{
              background: '#F8F9FA',
              border: '1px solid #CDD2D0',
              borderRadius: '10px',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#062013',
                opacity: 0.6,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6';
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center' }}>
              {/* Logo */}
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                <Image
                  src="/logo-dark.svg"
                  alt="TableXport"
                  width={100}
                  height={41}
                  style={{ height: 'auto' }}
                />
              </div>

              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#062013',
                  margin: '0 0 12px 0',
                }}
              >
                Install TableXport
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 'normal',
                  color: '#062013',
                  margin: '0 0 20px 0',
                  lineHeight: '1.5',
                }}
              >
                Install TableXport for instant access from your dock or home screen.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleInstall}
                  style={{
                    width: '100%',
                    background: 'white',
                    border: '1.5px solid #CDD2D0',
                    color: '#062013',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Download size={16} />
                  Install
                </button>

                <button
                  onClick={handleClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#062013',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '8px',
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                  }}
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* iOS Install Sheet */}
      <IOSInstallSheet 
        isOpen={showIOSSheet} 
        onClose={() => {
          setShowIOSSheet(false);
          onClose?.();
        }} 
      />
    </>
  );
};
