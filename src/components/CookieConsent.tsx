'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'cookieConsent' as const;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = window.localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
      setVisible(!accepted);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    } catch {
      // ignore private mode / quota
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[42] flex justify-center pt-2 pb-[max(1rem,calc(env(safe-area-inset-bottom)+12px))] sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="pointer-events-auto w-full max-w-lg sm:max-w-xl">
        <div className="flex flex-col gap-3 rounded-t-2xl border border-b-0 border-primary-light/70 border-x-0 border-t bg-white/92 px-4 py-4 shadow-[0_-8px_36px_-10px_rgba(6,32,19,0.18)] backdrop-blur-md supports-[backdrop-filter]:bg-white/85 sm:rounded-2xl sm:border sm:border-primary-light/70 sm:px-5 sm:py-3.5 sm:shadow-[0_8px_32px_-8px_rgba(6,32,19,0.2)] sm:flex-row sm:items-center sm:gap-4">
          <p className="text-pretty text-center text-[0.9375rem] leading-relaxed text-secondary/90 sm:flex-1 sm:text-left sm:text-sm sm:leading-snug">
            We use cookies for secure payments and authentication. No creepy tracking.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={dismiss}
            className="h-11 min-h-[44px] w-full shrink-0 font-semibold sm:h-auto sm:min-h-10 sm:w-auto"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
