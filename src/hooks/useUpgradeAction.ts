'use client';

import { useCallback, useRef, useState } from 'react';
import { initializePaddle, type PaddleEventData, type Environments } from '@paddle/paddle-js';
import { usePro } from '@/contexts/ProContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const PADDLE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? '';
const PADDLE_PRICE_ID_YEARLY = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_YEARLY ?? '';
const PADDLE_PRICE_ID_LIFETIME = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_LIFETIME ?? PADDLE_PRICE_ID;
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '';
const rawPaddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;
const PADDLE_ENVIRONMENT: Environments = rawPaddleEnvironment === 'live' || rawPaddleEnvironment === 'production'
  ? 'production'
  : 'sandbox';
const REFETCH_ATTEMPTS = 6;

interface StartUpgradeOptions {
  priceId?: string;
  onSuccess?: () => void;
  onCancelled?: () => void;
  onError?: (message: string) => void;
}

export { PADDLE_PRICE_ID_YEARLY, PADDLE_PRICE_ID_LIFETIME };

export type UpgradeCtaState = 'loading' | 'logged_out' | 'free' | 'pro';

export function useUpgradeAction() {
  const { isAuthenticated, user, loading: authLoading, signIn } = useGoogleAuth();
  const { isPro, isLoading: proLoading, activatePro, refetch } = usePro();
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const checkoutCompletedRef = useRef(false);
  const paddleInstanceRef = useRef<Awaited<ReturnType<typeof initializePaddle>> | null>(null);

  const ctaState: UpgradeCtaState = authLoading || proLoading
    ? 'loading'
    : isPro
      ? 'pro'
      : isAuthenticated
        ? 'free'
        : 'logged_out';

  const signInAndOpenCheckout = useCallback(async (options?: StartUpgradeOptions) => {
    setIsOpeningCheckout(true);
    try {
      await signIn({ action: 'upgrade' });
      // Wait a moment for session to settle, then open checkout
      await new Promise(resolve => setTimeout(resolve, 600));
      await openCheckout(options);
      return 'checkout';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start Google sign-in.';
      options?.onError?.(message);
      setIsOpeningCheckout(false);
      return 'error';
    }
  }, [signIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCheckout = useCallback(async (options?: StartUpgradeOptions) => {
    setIsOpeningCheckout(true);
    setIsCompletingCheckout(false);

    try {
      if (!PADDLE_CLIENT_TOKEN) {
        throw new Error('Missing Paddle client token. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.');
      }

      if (!PADDLE_PRICE_ID) {
        throw new Error('Missing Paddle price ID. Add NEXT_PUBLIC_PADDLE_PRICE_ID.');
      }

      if (!user?.id) {
        throw new Error('Please sign in before upgrading to Pro.');
      }

      const paddle = await initializePaddle({
        environment: PADDLE_ENVIRONMENT,
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: (event: PaddleEventData) => {
          if (event.name === 'checkout.completed') {
            checkoutCompletedRef.current = true;
            setIsCompletingCheckout(true);
            setCheckoutSuccess(true);
            activatePro();
            options?.onSuccess?.();
            setIsOpeningCheckout(false);

            // Close Paddle overlay immediately to prevent default success page
            if (paddleInstanceRef.current) {
              try {
                paddleInstanceRef.current.Checkout.close();
              } catch (error) {
                console.error('Failed to close Paddle checkout:', error);
              }
            }

            // Aggressive refetch to ensure session is updated
            let attempts = 0;
            const pollUntilPro = async () => {
              while (attempts < REFETCH_ATTEMPTS) {
                attempts += 1;
                await new Promise(resolve => setTimeout(resolve, attempts <= 2 ? 400 : 800));
                try {
                  await refetch();
                } catch {
                  // ignore
                }
              }
            };
            void pollUntilPro();
          }

          if (event.name === 'checkout.closed' && !checkoutCompletedRef.current) {
            options?.onCancelled?.();
            setIsCompletingCheckout(false);
            setIsOpeningCheckout(false);
          }
        },
      });

      if (!paddle) {
        throw new Error('Failed to initialize Paddle checkout.');
      }

      paddleInstanceRef.current = paddle;
      checkoutCompletedRef.current = false;

      paddle.Checkout.open({
        items: [
          {
            priceId: options?.priceId || PADDLE_PRICE_ID_LIFETIME,
            quantity: 1,
          },
        ],
        customer: user.email
          ? {
              email: user.email,
            }
          : undefined,
        customData: {
          user_id: user.id,
        },
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'light',
          locale: 'en',
        },
      });

      setIsOpeningCheckout(false);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open checkout.';
      options?.onError?.(message);
      setIsCompletingCheckout(false);
      setIsOpeningCheckout(false);
      return false;
    }
  }, [activatePro, refetch, user]);

  const startUpgrade = useCallback(async (options?: StartUpgradeOptions) => {
    if (ctaState === 'logged_out') {
      return await signInAndOpenCheckout(options);
    }

    if (ctaState === 'pro') {
      return 'pro';
    }

    if (ctaState === 'loading') {
      return 'loading';
    }

    await openCheckout(options);
    return 'checkout';
  }, [ctaState, openCheckout, signInAndOpenCheckout]);

  return {
    ctaState,
    isOpeningCheckout,
    isCompletingCheckout,
    checkoutSuccess,
    isAuthenticated,
    isPro,
    user,
    signInAndOpenCheckout,
    openCheckout,
    startUpgrade,
  };
}
