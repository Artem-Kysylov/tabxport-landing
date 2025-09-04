"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { motion } from 'framer-motion'
import { HiCheck } from 'react-icons/hi'

// URL Chrome Web Store — замени на ваш реальный
const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/tablexport/EXTENSION_ID'

const FreePlan = () => {
  const features: string[] = [
    'Local export (save to your device)',
    'Data summary & analytics',
    'Remember My Format',
    'Available formats: Excel (XLSX), CSV, DOCX, PDF',
  ]

  return (
    <AnimatedSection>
      <section id="price-plans" className="py-[50px] md:py-[100px]">
        <div className="container-custom">
          <FadeInUp>
            <h2 className="text-[40px] md:text-[55px] font-semibold text-center mb-[30px]">
              All features <span className="text-primary">free</span> for a limited time
            </h2>
          </FadeInUp>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-[10px] p-[30px] w-full md:w-[21.875rem] min-h-[24.375rem] transition-shadow duration-300 hover:shadow-lg bg-white border border-[rgba(6,32,19,0.2)]"
            >
              <h3 className="text-[28px] md:text-[32px] font-semibold mb-[30px]">
                Free
              </h3>

              <div className="space-y-4 mb-[30px]">
                {features.map((text, index) => (
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
                <Link
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full hover:scale-105 transition-transform duration-200">
                    Add to Chrome
                  </Button>
                </Link>
                <span className="text-sm text-secondary/60">
                  No credit card needed
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