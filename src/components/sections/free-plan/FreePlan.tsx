"use client"

import React, { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { motion } from 'framer-motion'
import { HiCheck } from 'react-icons/hi'
import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { useUpgradeAction } from '@/hooks/useUpgradeAction'
import { useUpgradeAutoResume } from '@/hooks/useUpgradeAutoResume'

const FreePlan = () => {
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { ctaState, isOpeningCheckout, isCompletingCheckout, startUpgrade } = useUpgradeAction()
  const shouldShowCheckoutError = !!checkoutError && !isOpeningCheckout && !isCompletingCheckout && ctaState !== 'logged_out'

  const freeFeatures: string[] = [
    'All standard formats (Excel, CSV, JSON)',
    'Live Table Preview',
    'Local Downloads',
    'Batch Processing (up to 3 tables)',
  ]

  const proFeatures: string[] = [
    'Everything in Free +',
    'Custom PDF Branding (Logos & Colors)',
    'Google Drive Integration',
    'Direct to Google Sheets',
    'Unlimited Batch Processing',
  ]

  const handleResumeUpgrade = useCallback(() => {
    setCheckoutError(null)
    void startUpgrade({
      onCancelled: () => {
        setCheckoutError('Payment was cancelled before completion.')
      },
      onError: (message) => {
        setCheckoutError(message)
      },
    })
  }, [startUpgrade])

  const { isResumingUpgrade } = useUpgradeAutoResume({
    onResume: handleResumeUpgrade,
  })

  const handleUpgrade = async () => {
    setCheckoutError(null)
    await startUpgrade({
      onCancelled: () => {
        setCheckoutError('Payment was cancelled before completion.')
      },
      onError: (message) => {
        setCheckoutError(message)
      },
    })
  }

  const buttonLabel = ctaState === 'logged_out'
    ? 'Sign in with Google to Upgrade'
    : ctaState === 'pro'
      ? '✅ Pro Active'
      : 'Get Pro Lifetime — $12'

  return (
    <>
      <AnimatedSection>
        <section id="price-plans" className="py-[50px] md:py-[100px]">
          <div className="container-custom">
            <FadeInUp>
              <div className='text-center mb-[40px]'>
                <h2 className="text-[40px] md:text-[55px] font-semibold mb-3">
                  Simple Pricing. <span className="text-primary">Lifetime Access.</span>
                </h2>
                <p className='text-secondary/75'>
                  Pay once, use forever. $12 Early Bird deal ends soon.
                </p>
              </div>
            </FadeInUp>

            <div className="flex flex-col md:flex-row justify-center gap-[30px] max-w-[760px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-[10px] p-[30px] w-full md:w-[21.875rem] min-h-[28rem] transition-shadow duration-300 hover:shadow-lg bg-white border border-[rgba(6,32,19,0.2)]"
              >
                <div className='mb-[30px]'>
                  <h3 className="text-[28px] md:text-[32px] font-semibold">
                    Free
                  </h3>
                  <p className='text-[30px] font-semibold mt-2'>$0</p>
                </div>

                <div className="space-y-4 mb-[30px]">
                  {freeFeatures.map((text, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      viewport={{ once: true }}
                    >
                      <HiCheck className="text-primary" size={20} />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Link href='/#dropzone' className="w-full">
                    <Button variant="outline" className="w-full hover:scale-105 transition-transform duration-200 border-secondary/20 text-secondary hover:bg-transparent hover:text-secondary hover:border-secondary/20">
                      Start for Free
                    </Button>
                  </Link>
                  <span className="text-sm text-secondary/60">
                    No credit card needed
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="rounded-[10px] p-[30px] w-full md:w-[21.875rem] min-h-[28rem] transition-shadow duration-300 hover:shadow-lg bg-[#D2F2E2] border border-primary shadow-[0_0_0_1px_rgba(27,147,88,0.25),0_20px_50px_rgba(27,147,88,0.18)]"
              >
                <div className='mb-[30px]'>
                  <h3 className="text-[28px] md:text-[32px] font-semibold">
                    Pro Lifetime
                  </h3>
                  <div className='flex items-end gap-3 mt-2'>
                    <p className='text-[30px] font-semibold'>$12</p>
                    <span className='text-secondary/50 line-through pb-1'>$29</span>
                  </div>
                </div>

                <div className="space-y-4 mb-[30px]">
                  {proFeatures.map((text, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      viewport={{ once: true }}
                    >
                      <HiCheck className="text-primary" size={20} />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    className="w-full hover:scale-105 transition-transform duration-200"
                    onClick={handleUpgrade}
                    disabled={isOpeningCheckout || isCompletingCheckout || ctaState === 'loading' || ctaState === 'pro'}
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
                  {shouldShowCheckoutError && (
                    <span className="text-sm text-red-600 text-center">
                      {checkoutError}
                    </span>
                  )}
                  <span className="text-sm text-secondary/60">
                    {ctaState === 'logged_out' ? 'Sign in to continue with secure checkout' : 'One-time payment via Paddle'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Continue upgrading to unlock TableXport Pro."
      />

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