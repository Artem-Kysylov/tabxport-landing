'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpgradeAction } from '@/hooks/useUpgradeAction';
import { SuccessState } from './SuccessState';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { ctaState, isOpeningCheckout, isCompletingCheckout, checkoutSuccess, startUpgrade } = useUpgradeAction();
  const isPro = ctaState === 'pro';
  const shouldShowCheckoutError = !!checkoutError && !isOpeningCheckout && !isCompletingCheckout && ctaState !== 'logged_out';

  const features = [
    'PDF Export with Custom Branding',
    'Google Drive & Sheets Integration',
    'Unlimited Batch Processing',
    'Priority Support',
  ];

  useEffect(() => {
    if (!isOpen) {
      setCheckoutError(null);
    }
  }, [isOpen]);

  const handleUpgrade = async () => {
    setCheckoutError(null);
    await startUpgrade({
      onCancelled: () => {
        setCheckoutError('Payment was cancelled before completion.');
      },
      onError: (message) => {
        setCheckoutError(message);
      },
    });
  };

  const buttonLabel = ctaState === 'logged_out'
    ? 'Sign in with Google to Upgrade'
    : ctaState === 'pro'
      ? 'Current Plan'
      : 'Get Pro Lifetime — $12';

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
            {!checkoutSuccess && (
              <button
                onClick={isCompletingCheckout ? undefined : onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close modal"
                disabled={isCompletingCheckout}
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}

            {checkoutSuccess ? (
              <SuccessState onClose={onClose} />
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles size={32} className="text-primary" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isPro ? 'You Have Lifetime Access' : 'Unlock the Full Power of TableXport'}
                </h2>

                {feature && (
                  <p className="text-sm text-gray-600 mb-6">
                    {feature}
                  </p>
                )}

                <div className="w-full bg-gray-50 rounded-xl p-6 mb-6">
                  {isPro ? (
                    <div className="text-center text-sm text-gray-700">
                      Thank you for your support. Your account already has Pro Lifetime access.
                    </div>
                  ) : (
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
                  )}
                </div>

                {!isPro && (
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="text-4xl font-bold text-gray-900">$12</span>
                      <span className="text-gray-500">/ lifetime</span>
                    </div>
                    <p className="text-sm text-primary font-semibold">
                      🎉 Early Bird Special
                    </p>
                  </div>
                )}

                {shouldShowCheckoutError && (
                  <div className="w-full mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {checkoutError}
                  </div>
                )}

                <div className="flex flex-col gap-3 w-full">
                  <Button
                    onClick={handleUpgrade}
                    disabled={isOpeningCheckout || isCompletingCheckout || isPro || ctaState === 'loading'}
                    className="w-full bg-primary text-white font-semibold py-6 rounded-xl shadow-primary-btn transition-all duration-200 ease-out hover:-translate-y-px hover:bg-primary/90 hover:shadow-primary-btn-hover"
                  >
                    <span>
                      {ctaState === 'loading'
                        ? 'Loading...'
                        : isCompletingCheckout
                          ? 'Finalizing Payment...'
                        : isOpeningCheckout
                          ? 'Opening Checkout...'
                          : buttonLabel}
                    </span>
                  </Button>
                  <button
                    onClick={isCompletingCheckout ? undefined : onClose}
                    disabled={isCompletingCheckout}
                    className="w-full text-gray-500 hover:text-gray-700 font-medium py-3 transition-colors cursor-pointer"
                  >
                    {isPro ? 'Close' : 'Continue with Free'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
          {isCompletingCheckout && !checkoutSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-white/92 backdrop-blur-sm"
            >
              <div className="flex max-w-sm flex-col items-center text-center px-6">
                <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <h3 className="text-xl font-semibold text-secondary mb-2">Finalizing your upgrade</h3>
                <p className="text-sm text-secondary/70">Please wait while we complete your payment.</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
