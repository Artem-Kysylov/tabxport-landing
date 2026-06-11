"use client"

import React, { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { motion } from 'framer-motion'
import { HiCheck } from 'react-icons/hi'
import { useUpgradeAction, PADDLE_PRICE_ID_YEARLY, PADDLE_PRICE_ID_LIFETIME } from '@/hooks/useUpgradeAction'
import { useUpgradeAutoResume } from '@/hooks/useUpgradeAutoResume'
import { useGoogleAuthUi } from '@/contexts/GoogleAuthUiContext'

const yearlyFeatures: string[] = [
  'Unlimited exports for 12 months',
  'All formats (Excel, CSV, JSON, Word)',
  'Custom PDF Branding',
  'Google Drive & Sheets Integration',
  'Batch Processing',
]

const lifetimeFeatures: string[] = [
  'Everything in 1-Year, forever',
  'All future export formats',
  'Priority updates & support',
  'Lifetime access — pay once',
  'No renewals, no surprises',
]

const FreePlan = () => {
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const { ctaState, isOpeningCheckout, isCompletingCheckout, startUpgrade } = useUpgradeAction()
  const { openGoogleAuthPopup } = useGoogleAuthUi()
  const shouldShowCheckoutError = !!checkoutError && !isOpeningCheckout && !isCompletingCheckout && ctaState !== 'logged_out'

  const handleResumeUpgrade = useCallback(() => {
    setCheckoutError(null)
    void startUpgrade({
      priceId: PADDLE_PRICE_ID_LIFETIME,
      onCancelled: () => setCheckoutError('Payment was cancelled before completion.'),
      onError: (message) => setCheckoutError(message),
    })
  }, [startUpgrade])

  const { isResumingUpgrade } = useUpgradeAutoResume({ onResume: handleResumeUpgrade })

  const handleUpgradeYearly = async () => {
    setCheckoutError(null)
    await startUpgrade({
      priceId: PADDLE_PRICE_ID_YEARLY,
      onCancelled: () => setCheckoutError('Payment was cancelled before completion.'),
      onError: (message) => setCheckoutError(message),
    })
  }

  const handleUpgradeLifetime = async () => {
    setCheckoutError(null)
    await startUpgrade({
      priceId: PADDLE_PRICE_ID_LIFETIME,
      onCancelled: () => setCheckoutError('Payment was cancelled before completion.'),
      onError: (message) => setCheckoutError(message),
    })
  }

  const isDisabled = isOpeningCheckout || isCompletingCheckout || ctaState === 'loading' || ctaState === 'pro'

  const getButtonLabel = (baseLabel: string) =>
    ctaState === 'loading'
      ? 'Loading...'
      : isCompletingCheckout
        ? 'Finalizing Payment...'
        : isOpeningCheckout
          ? 'Opening Checkout...'
          : ctaState === 'logged_out'
            ? 'Sign in to Buy'
            : ctaState === 'pro'
              ? '✅ Pro Active'
              : baseLabel

  const alreadyProSignInLink = ctaState !== 'pro' ? (
    <p className="text-xs text-secondary/60 mt-1">
      Already Pro?{' '}
      <button
        type="button"
        onClick={openGoogleAuthPopup}
        className="text-primary font-medium hover:underline cursor-pointer transition-colors"
      >
        Sign in
      </button>
    </p>
  ) : null

  return (
    <>
      <AnimatedSection>
        <section id="pricing" className="py-[50px] md:py-[100px]">
          <div className="container-custom">
            <FadeInUp>
              <div className='text-center mb-[40px]'>
                <h2 className="text-[40px] md:text-[55px] font-semibold mb-3">
                  Simple Pricing. <span className="text-primary">Professional Data Export.</span>
                </h2>
                <p className='text-secondary/75'>
                  Choose the plan that fits your workflow. Launch Special for Early Users.
                </p>
              </div>
            </FadeInUp>

            <div className="flex flex-col md:flex-row justify-center gap-[30px] max-w-[760px] mx-auto">

              {/* 1-Year Pass — anchor / decoy */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="rounded-[10px] p-[30px] w-full md:w-[21.875rem] min-h-[28rem] transition-shadow duration-300 hover:shadow-lg bg-white border border-[rgba(6,32,19,0.2)]"
              >
                <div className='mb-[30px]'>
                  <h3 className="text-[28px] md:text-[32px] font-semibold">
                    1-Year Pass
                  </h3>
                  <p className='text-[30px] font-semibold mt-2'>$19</p>
                  <p className='text-sm text-secondary/60 mt-1'>Unlimited exports for 12 months</p>
                </div>

                <div className="space-y-4 mb-[30px]">
                  {yearlyFeatures.map((text, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      viewport={{ once: true }}
                    >
                      <HiCheck className="text-primary shrink-0" size={20} />
                      <span className="text-sm">{text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-full hover:scale-105 transition-transform duration-200 border-secondary/20 text-secondary hover:bg-transparent hover:text-secondary hover:border-secondary/20"
                    onClick={handleUpgradeYearly}
                    disabled={isDisabled}
                  >
                    {getButtonLabel('Get 1-Year Pass — $19')}
                  </Button>
                  {alreadyProSignInLink}
                </div>
              </motion.div>

              {/* Pro Lifetime — dominant hero card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative rounded-[10px] p-[30px] w-full md:w-[21.875rem] min-h-[28rem] transition-shadow duration-300 hover:shadow-xl bg-[#D2F2E2] border border-primary shadow-[0_0_0_1px_rgba(27,147,88,0.25),0_20px_50px_rgba(27,147,88,0.18)]"
              >
                {/* Best Value badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #1B9358, #16a34a)' }}
                  >
                    Best Value
                  </span>
                </div>

                <div className='mb-[30px] mt-3'>
                  <h3 className="text-[28px] md:text-[32px] font-semibold">
                    Pro Lifetime
                  </h3>
                  <div className='flex items-end gap-3 mt-2'>
                    <p className='text-[30px] font-semibold'>$29</p>
                    <span className='text-secondary/50 line-through pb-1'>$39</span>
                  </div>
                  <p className='text-sm text-secondary/60 mt-1'>One-time payment, forever</p>
                </div>

                <div className="space-y-4 mb-[30px]">
                  {lifetimeFeatures.map((text, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      viewport={{ once: true }}
                    >
                      <HiCheck className="text-primary shrink-0" size={20} />
                      <span className="text-sm">{text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    className="w-full hover:scale-105 transition-transform duration-200"
                    onClick={handleUpgradeLifetime}
                    disabled={isDisabled}
                  >
                    {getButtonLabel('Get Pro Lifetime — $29')}
                  </Button>
                  {shouldShowCheckoutError && (
                    <span className="text-sm text-red-600 text-center">
                      {checkoutError}
                    </span>
                  )}
                  {alreadyProSignInLink}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {isCompletingCheckout && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white/92 backdrop-blur-sm px-6">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <h3 className="text-xl font-semibold text-secondary mb-2">Finalizing your upgrade</h3>
            <p className="text-sm text-secondary/70">Please wait while we complete your payment and open your success page.</p>
          </div>
        </div>
      )}

      {isResumingUpgrade && !isCompletingCheckout && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/92 backdrop-blur-sm px-6">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <h3 className="text-xl font-semibold text-secondary mb-2">Restoring your upgrade flow</h3>
            <p className="text-sm text-secondary/70">Please wait while we sign you in and open secure checkout.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default FreePlan
