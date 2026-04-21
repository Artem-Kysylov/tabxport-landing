'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import Image from 'next/image';
import { IOSInstallSheet } from './IOSInstallSheet';
import {
  getDeferredInstallPrompt,
  subscribeDeferredInstallPrompt,
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

interface PWAInstallPromptProps {
  onClose?: () => void;
  trigger?: boolean;
  forceShow?: boolean;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onClose,
  trigger = false,
  forceShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPromptReady, setDeferredPromptReady] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSSheet, setShowIOSSheet] = useState(false);

  const syncDeferred = () => {
    setDeferredPromptReady(getDeferredInstallPrompt() !== null);
  };

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

    const { outcome } = await triggerNativeInstallPrompt();

    if (outcome === 'accepted') {
      try {
        localStorage.setItem('tx_pwa_installed', 'true');
      } catch {
        // ignore
      }
      hidePrompt();
      return;
    }

    if (outcome === 'dismissed') {
      hidePrompt();
      return;
    }

    // No native prompt (e.g. Firefox, or criteria not met) — keep panel open with manual hints
    syncDeferred();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsIOS(detectIOSDevice());

    const unsub = subscribeDeferredInstallPrompt(syncDeferred);

    const handleAppInstalled = () => {
      try {
        localStorage.setItem('tx_pwa_installed', 'true');
      } catch (error) {
        console.error('Install state error:', error);
      }
      syncDeferred();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      unsub();
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!trigger) {
      setIsVisible(false);
      return;
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasNativeInstall = getDeferredInstallPrompt() !== null;
    const canOpenPrompt = isIOS || hasNativeInstall;

    if (forceShow) {
      if (!isStandalone) {
        setIsVisible(true);
      }
      return;
    }

    const isDismissed = localStorage.getItem('tx_pwa_prompt_dismissed') === 'true';
    if (!isStandalone && !isDismissed && canOpenPrompt) {
      setIsVisible(true);
    }
  }, [trigger, forceShow, isIOS, deferredPromptReady]);

  const showDesktopManualHint = !isIOS && !deferredPromptReady && isVisible;

  return (
    <>
      {isVisible && (
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

              {showDesktopManualHint && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#062013',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5',
                    opacity: 0.85,
                    textAlign: 'left',
                  }}
                >
                  <strong>Chrome or Edge (desktop):</strong> open the install menu (⊕ or ⋮ in the address bar) and
                  choose <em>Install TableXport</em>. If you don&apos;t see it, the site may need a moment after load —
                  try refreshing once.
                </p>
              )}

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
                  {deferredPromptReady ? 'Install' : isIOS ? 'Install' : 'Try install prompt'}
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
