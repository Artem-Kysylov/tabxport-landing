"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { motion } from 'framer-motion'
import { HiCheck } from 'react-icons/hi'

const PADDLE_CHECKOUT_URL = process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_URL

const FreePlan = () => {
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

  const handleCheckout = () => {
    if (typeof window === 'undefined') {
      return
    }

    if (PADDLE_CHECKOUT_URL) {
      window.location.href = PADDLE_CHECKOUT_URL
      return
    }

    window.location.href = 'mailto:hello@tablexport.com?subject=TableXport%20Pro%20Lifetime'
  }

  return (
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
                  <Button className="w-full hover:scale-105 transition-transform duration-200">
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
                <Button className="w-full hover:scale-105 transition-transform duration-200" onClick={handleCheckout}>
                  Get Lifetime Access
                </Button>
                <span className="text-sm text-secondary/60">
                  One-time payment via Paddle
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default FreePlan