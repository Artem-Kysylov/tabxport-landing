'use client';

import { useEffect, useRef } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { usePro } from '@/contexts/ProContext';

const UPGRADE_RESUME_KEY = 'tx_upgrade_resume_consumed';

interface UseUpgradeAutoResumeOptions {
  enabled?: boolean;
  onResume: () => void;
}

export function useUpgradeAutoResume({ enabled = true, onResume }: UseUpgradeAutoResumeOptions) {
  const { isAuthenticated, loading: authLoading } = useGoogleAuth();
  const { isPro, isLoading: proLoading } = usePro();
  const resumedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const action = currentUrl.searchParams.get('action');

    if (action !== 'upgrade') {
      resumedRef.current = false;
      try {
        sessionStorage.removeItem(UPGRADE_RESUME_KEY);
      } catch {
      }
      return;
    }

    let alreadyConsumed = false;

    try {
      alreadyConsumed = sessionStorage.getItem(UPGRADE_RESUME_KEY) === 'true';
    } catch {
      alreadyConsumed = resumedRef.current;
    }

    if (!enabled || resumedRef.current || alreadyConsumed || authLoading || proLoading) {
      return;
    }

    currentUrl.searchParams.delete('action');
    const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

    if (isAuthenticated && !isPro) {
      resumedRef.current = true;
      try {
        sessionStorage.setItem(UPGRADE_RESUME_KEY, 'true');
      } catch {
      }
      onResume();
      window.history.replaceState(null, '', nextUrl);
      return;
    }

    if (isAuthenticated && isPro) {
      resumedRef.current = true;
      try {
        sessionStorage.setItem(UPGRADE_RESUME_KEY, 'true');
      } catch {
      }
      window.history.replaceState(null, '', nextUrl);
    }
  }, [authLoading, enabled, isAuthenticated, isPro, onResume, proLoading]);

  if (typeof window === 'undefined') {
    return {
      isResumingUpgrade: false,
    };
  }

  const currentUrl = new URL(window.location.href);
  const isUpgradeAction = currentUrl.searchParams.get('action') === 'upgrade';
  const isResumingUpgrade = enabled && isUpgradeAction && (!isAuthenticated || authLoading || proLoading);

  return {
    isResumingUpgrade,
  };
}
