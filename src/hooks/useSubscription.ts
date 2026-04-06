'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SubscriptionPlan, UserProfile } from '@/types/database';

const PENDING_PRO_STORAGE_KEY = 'tx_pending_pro_activation';
const KNOWN_PRO_PURCHASE_KEY = 'tx_known_pro_purchase';

function readPendingProActivation(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(PENDING_PRO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writePendingProActivation(value: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value) {
      window.sessionStorage.setItem(PENDING_PRO_STORAGE_KEY, 'true');
      return;
    }

    window.sessionStorage.removeItem(PENDING_PRO_STORAGE_KEY);
  } catch {
  }
}

function readKnownProPurchase(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(KNOWN_PRO_PURCHASE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeKnownProPurchase(value: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value) {
      window.localStorage.setItem(KNOWN_PRO_PURCHASE_KEY, 'true');
      return;
    }

    window.localStorage.removeItem(KNOWN_PRO_PURCHASE_KEY);
  } catch {
  }
}

interface UseSubscriptionReturn {
  profile: UserProfile | null;
  isPro: boolean;
  hasKnownProPurchase: boolean;
  planType: SubscriptionPlan;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  activatePro: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [optimisticIsPro, setOptimisticIsPro] = useState<boolean>(() => readPendingProActivation());
  const [hasKnownProPurchase, setHasKnownProPurchase] = useState<boolean>(() => readKnownProPurchase());

  const supabase = useMemo(() => createClient(), []);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setProfile(null);
        setOptimisticIsPro(false);
        writePendingProActivation(false);
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setProfile(null);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data);
        if (data.is_pro) {
          setOptimisticIsPro(false);
          writePendingProActivation(false);
          setHasKnownProPurchase(true);
          writeKnownProPurchase(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!userId || !optimisticIsPro || profile?.is_pro === true) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const pollForProfileUpgrade = async () => {
      while (!cancelled && attempts < 8) {
        attempts += 1;
        await new Promise((resolve) => window.setTimeout(resolve, attempts <= 3 ? 1200 : 2500));
        if (cancelled) {
          return;
        }
        await fetchSubscription();
      }
    };

    void pollForProfileUpgrade();

    return () => {
      cancelled = true;
    };
  }, [fetchSubscription, optimisticIsPro, profile?.is_pro, userId]);

  useEffect(() => {
    fetchSubscription();
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      void fetchSubscription();
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [fetchSubscription, supabase]);

  const activatePro = () => {
    setOptimisticIsPro(true);
    writePendingProActivation(true);
    setHasKnownProPurchase(true);
    writeKnownProPurchase(true);
    setProfile((current) => {
      const now = new Date().toISOString();

      if (current) {
        return {
          ...current,
          is_pro: true,
          updated_at: now,
        };
      }

      if (!userId) {
        return current;
      }

      return {
        id: `optimistic-${userId}`,
        user_id: userId,
        full_name: null,
        avatar_url: null,
        google_drive_folder_id: null,
        google_drive_enabled: false,
        preferences: null,
        is_pro: true,
        created_at: now,
        updated_at: now,
      };
    });
  };

  const isPro = optimisticIsPro || profile?.is_pro === true;
  const planType: SubscriptionPlan = isPro ? 'pro' : 'free';

  return {
    profile,
    isPro,
    hasKnownProPurchase,
    planType,
    isLoading,
    error,
    refetch: fetchSubscription,
    activatePro,
  };
}
