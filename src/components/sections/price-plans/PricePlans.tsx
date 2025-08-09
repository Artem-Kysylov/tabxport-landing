"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { HiCheck, HiX } from 'react-icons/hi'
import Link from 'next/link'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { motion } from 'framer-motion'
import GoogleAuthButton from '@/components/auth/google-auth-button'

interface PriceFeature {
  text: string
  included: boolean
}

interface PriceCardProps {
  title: string
  price?: string
  features: PriceFeature[]
  buttonText: string
  subText: string
  isPro?: boolean
  index: number
}

const PriceCard: React.FC<PriceCardProps> = ({
  title,
  price,
  features,
  buttonText,
  subText,
  isPro = false,
  index
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: isPro ? 0.5 : 0.6,
        delay: index * 0.2,
        ease: "easeOut"
      }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`rounded-[10px] p-[30px] w-full md:w-[21.875rem] min-h-[24.375rem] transition-shadow duration-300 hover:shadow-lg ${
        isPro ? 'bg-[#D2F2E2]' : 'bg-white border border-[rgba(6,32,19,0.2)]'
      }`}
    >
      <h3 className="text-[28px] md:text-[32px] font-semibold mb-[30px]">
        {title} {price}
      </h3>
      <div className="space-y-4 mb-[30px]">
        {features.map((feature, featureIndex) => (
          <motion.div 
            key={featureIndex} 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: (index * 0.2) + (featureIndex * 0.1) + 0.3 }}
            viewport={{ once: true }}
          >
            {feature.included ? (
              <HiCheck className="text-primary" size={20} />
            ) : (
              <HiX className="text-secondary/20" size={20} />
            )}
            <span>{feature.text}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        {isPro ? (
          <GoogleAuthButton 
            variant="default"
            className="w-full hover:scale-105 transition-transform duration-200"
            redirectTo="/payment?source=landing"
          >
            {buttonText}
          </GoogleAuthButton>
        ) : (
          <Link href="https://www.google.com/webhp?hl=ru&sa=X&ved=0ahUKEwjUssv37ubrAhVvx4sKHR5fBywQPAgI" target='_blank' className="w-full">
            <Button variant="outline" className="w-full hover:scale-105 transition-transform duration-200">
              {buttonText}
            </Button>
          </Link>
        )}
        <span className="text-sm text-secondary/60">{subText}</span>
      </div>
    </motion.div>
  )
}

const PricePlans = () => {
  const plans = [
    {
      title: 'Free',
      features: [
        { text: '10 exports/day', included: true },
        { text: ' Excel, CSV, PDF', included: true },
        { text: 'Google Drive', included: false }
      ],
      buttonText: 'Get Started',
      subText: 'No credit card needed'
    },
    {
      title: 'Pro',
      price: '($5/Month)',
      features: [
        { text: 'Unlimited exports', included: true },
        { text: 'Google Sheets on Drive', included: true },
        { text: 'Priority Help', included: true }
      ],
      buttonText: 'Upgrade Now',
      subText: 'Cancel anytime',
      isPro: true
    }
  ]

  return (
    <AnimatedSection>
      <section id="price-plans" className="py-[50px] md:py-[100px]">
        <div className='container-custom'>
          <FadeInUp>
            <h2 className='text-[40px] md:text-[55px] font-semibold text-center mb-[30px]'>
              Unlock <span className='text-primary'>Productivity</span>
            </h2>
          </FadeInUp>
          
          <div className="flex flex-col md:flex-row justify-center gap-[30px] max-w-[21.875rem] md:max-w-none mx-auto">
            {plans.map((plan, index) => (
              <PriceCard key={index} {...plan} index={index} />
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default PricePlans
