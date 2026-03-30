'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subscription, SubscriptionPlan } from '@/types/database';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isPro: boolean;
  planType: SubscriptionPlan;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

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
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isPro = subscription?.plan_type === 'pro' && subscription?.status === 'active';
  const planType: SubscriptionPlan = subscription?.plan_type || 'free';

  return {
    subscription,
    isPro,
    planType,
    isLoading,
    error,
    refetch: fetchSubscription,
  };
}
