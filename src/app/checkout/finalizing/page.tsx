'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_DELAY_MS = 3500;
const DEFAULT_NEXT_PATH = '/checkout/success';
const MAX_DELAY_MS = 10000;

function parseDelay(value: string | null): number {
  if (!value) {
    return DEFAULT_DELAY_MS;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_DELAY_MS;
  }

  return Math.min(parsed, MAX_DELAY_MS);
}

export default function CheckoutFinalizingPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const nextPath = currentUrl.searchParams.get('next') || DEFAULT_NEXT_PATH;
    const delay = parseDelay(currentUrl.searchParams.get('delay'));

    const timeoutId = window.setTimeout(() => {
      router.replace(nextPath);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <h1 className="mb-3 text-3xl font-semibold text-secondary sm:text-4xl">
          Finalizing your upgrade
        </h1>
        <p className="max-w-xl text-base text-secondary/70 sm:text-lg">
          Please wait while we confirm your payment and prepare your TableXport Pro access.
        </p>
      </div>
    </main>
  );
}
