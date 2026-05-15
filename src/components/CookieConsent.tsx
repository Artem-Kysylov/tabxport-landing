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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[42] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div
        className="pointer-events-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-primary-light/70 bg-white/80 px-4 py-3 shadow-[0_8px_32px_-8px_rgba(6,32,19,0.2)] backdrop-blur-md sm:max-w-xl sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-3.5"
      >
        <p className="text-center text-sm leading-snug text-secondary/90 sm:flex-1 sm:text-left">
          We use cookies for secure payments and authentication. No creepy tracking.
        </p>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={dismiss}
          className="min-h-9 shrink-0 self-center font-semibold sm:self-auto"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
