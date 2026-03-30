'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subscription, SubscriptionPlan } from '@/types/database';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isPro: boolean;
  planType: SubscriptionPlan;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  activatePro: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [optimisticIsPro, setOptimisticIsPro] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setSubscription(null);
        setOptimisticIsPro(false);
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setSubscription(null);
        } else {
          throw fetchError;
        }
      } else {
        setSubscription(data);
        if (data.plan_type === 'pro' && data.status === 'active') {
          setOptimisticIsPro(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

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
    setSubscription((current) => {
      const now = new Date().toISOString();

      if (current) {
        return {
          ...current,
          plan_type: 'pro',
          status: 'active',
          updated_at: now,
        };
      }

      if (!userId) {
        return current;
      }

      return {
        id: `optimistic-${userId}`,
        user_id: userId,
        plan_type: 'pro',
        status: 'active',
        paypal_subscription_id: null,
        paypal_plan_id: null,
        current_period_start: null,
        current_period_end: null,
        trial_end: null,
        monthly_price: null,
        currency: 'USD',
        created_at: now,
        updated_at: now,
      };
    });
  };

  const isPro = optimisticIsPro || (subscription?.plan_type === 'pro' && subscription?.status === 'active');
  const planType: SubscriptionPlan = subscription?.plan_type || 'free';

  return {
    subscription,
    isPro,
    planType,
    isLoading,
    error,
    refetch: fetchSubscription,
    activatePro,
  };
}
