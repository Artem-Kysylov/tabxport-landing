'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionPlan, UserProfile } from '@/types/database';

interface ProContextValue {
  isPro: boolean;
  hasKnownProPurchase: boolean;
  planType: SubscriptionPlan;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  activatePro: () => void;
}

const ProContext = createContext<ProContextValue | undefined>(undefined);

interface ProProviderProps {
  children: ReactNode;
}

export function ProProvider({ children }: ProProviderProps) {
  const subscriptionData = useSubscription();

  return (
    <ProContext.Provider value={subscriptionData}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro(): ProContextValue {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error('usePro must be used within a ProProvider');
  }
  return context;
}
