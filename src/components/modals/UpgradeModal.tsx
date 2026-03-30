'use client';

import React, { useEffect, useRef, useState } from 'react';
import { initializePaddle, type PaddleEventData } from '@paddle/paddle-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePro } from '@/contexts/ProContext';
import { createClient } from '@/lib/supabase/client';

const PADDLE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? 'pri_01kmzphzgfw9gecj77dp5apxve';
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN ?? '';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const checkoutCompletedRef = useRef(false);
  const { activatePro, refetch } = usePro();

  const features = [
    'PDF Export with Custom Branding',
    'Google Drive & Sheets Integration',
    'Unlimited Batch Processing',
    'Priority Support',
  ];

  useEffect(() => {
    if (!isOpen) {
      setCheckoutError(null);
      setIsOpeningCheckout(false);
      checkoutCompletedRef.current = false;
    }
  }, [isOpen]);

  const handleUpgrade = async () => {
    setCheckoutError(null);
    setIsOpeningCheckout(true);

    try {
      if (!PADDLE_CLIENT_TOKEN) {
        throw new Error('Missing Paddle client token. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN for Sandbox checkout.');
      }

      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('Please sign in before upgrading to Pro.');
      }

      const paddle = await initializePaddle({
        environment: 'sandbox',
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: (event: PaddleEventData) => {
          if (event.name === 'checkout.completed') {
            checkoutCompletedRef.current = true;
            activatePro();
            onClose();
            toast.success('Welcome to TableXport Pro!');
            setCheckoutError(null);
            setIsOpeningCheckout(false);
            window.setTimeout(() => {
              void refetch();
            }, 1500);
            window.setTimeout(() => {
              void refetch();
            }, 4000);
          }

          if (event.name === 'checkout.closed' && !checkoutCompletedRef.current) {
            setCheckoutError('Payment was cancelled before completion.');
            setIsOpeningCheckout(false);
          }
        },
      });

      if (!paddle) {
        throw new Error('Failed to initialize Paddle checkout.');
      }

      checkoutCompletedRef.current = false;

      paddle.Checkout.open({
        items: [
          {
            priceId: PADDLE_PRICE_ID,
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open checkout.';
      setCheckoutError(message);
      setIsOpeningCheckout(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock the Full Power of TableXport
              </h2>

              {feature && (
                <p className="text-sm text-gray-600 mb-6">
                  {feature}
                </p>
              )}

              <div className="w-full bg-gray-50 rounded-xl p-6 mb-6">
                <ul className="space-y-3 text-left">
                  {features.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Check size={18} className="text-primary" />
                      </div>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-4xl font-bold text-gray-900">$12</span>
                  <span className="text-gray-500">/ lifetime</span>
                </div>
                <p className="text-sm text-primary font-semibold">
                  🎉 Early Bird Special
                </p>
              </div>

              {checkoutError && (
                <div className="w-full mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {checkoutError}
                </div>
              )}

              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={handleUpgrade}
                  disabled={isOpeningCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isOpeningCheckout ? 'Opening Checkout...' : 'Get Pro Lifetime'}
                </Button>
                <button
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-3 transition-colors cursor-pointer"
                >
                  Continue with Free
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
