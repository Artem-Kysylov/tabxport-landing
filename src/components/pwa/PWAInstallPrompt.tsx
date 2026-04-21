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

const detectBrowser = (): { isChrome: boolean; isEdge: boolean; canInstallPWA: boolean } => {
  if (typeof window === 'undefined') return { isChrome: false, isEdge: false, canInstallPWA: false };

  const userAgent = window.navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const canInstallPWA = isChrome || isEdge;

  return { isChrome, isEdge, canInstallPWA };
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ isChrome: false, isEdge: false, canInstallPWA: false });

  const syncDeferred = () => {
    setDeferredPromptReady(getDeferredInstallPrompt() !== null);
  };

  // Keep deferredPromptReady in sync as the shared store updates
  useEffect(() => {
    return subscribeDeferredInstallPrompt(syncDeferred);
  // syncDeferred is stable (no deps) — intentional omission
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    if (isProcessing) return;

    setIsProcessing(true);

    try {
      console.log('PWA Install: Attempting to trigger native install prompt...');
      const { outcome } = await triggerNativeInstallPrompt();
      console.log('PWA Install: Native prompt outcome:', outcome);

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

      // No native prompt available - stay open with manual instructions
      console.log('PWA Install: Native prompt not available, showing manual instructions');
      syncDeferred();
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsIOS(detectIOSDevice());
    setBrowserInfo(detectBrowser());

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
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const showDesktopManualHint = !isIOS && !deferredPromptReady && isVisible && browserInfo.canInstallPWA;
  const showUnsupportedBrowserHint = !isIOS && !deferredPromptReady && isVisible && !browserInfo.canInstallPWA;

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
                <div
                  style={{
                    fontSize: '12px',
                    color: '#062013',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5',
                    textAlign: 'left',
                    backgroundColor: '#f0f9ff',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #0ea5e9',
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                    {browserInfo.isChrome ? '🔵 Chrome' : '🔷 Edge'} — Manual Installation:
                  </p>
                  <p style={{ margin: '0' }}>
                    Look for the <strong>install icon</strong> (⊕ or download symbol) in your address bar and click it. 
                    If it's not there, try refreshing the page or check the browser menu (⋮) for "Install app" option.
                  </p>
                </div>
              )}

              {showUnsupportedBrowserHint && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#062013',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5',
                    textAlign: 'left',
                    backgroundColor: '#fef3c7',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #f59e0b',
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                    ⚠️ Browser not supported
                  </p>
                  <p style={{ margin: '0' }}>
                    Your browser doesn't support app installation. Try using <strong>Chrome</strong> or <strong>Edge</strong> for the best experience with TableXport.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleInstall}
                  disabled={isProcessing || showUnsupportedBrowserHint}
                  style={{
                    width: '100%',
                    background: (isProcessing || showUnsupportedBrowserHint) ? '#f3f4f6' : 'white',
                    border: '1.5px solid #CDD2D0',
                    color: (isProcessing || showUnsupportedBrowserHint) ? '#9ca3af' : '#062013',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: (isProcessing || showUnsupportedBrowserHint) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing && !showUnsupportedBrowserHint) {
                      e.currentTarget.style.opacity = '0.5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing && !showUnsupportedBrowserHint) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  <Download size={16} />
                  {isProcessing 
                    ? 'Opening install prompt...' 
                    : deferredPromptReady 
                      ? 'Install Now'
                      : isIOS
                        ? 'Show Instructions'
                        : showUnsupportedBrowserHint
                          ? 'Not Available'
                          : 'Try Browser Install'
                  }
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
