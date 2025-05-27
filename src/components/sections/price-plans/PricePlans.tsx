import React from 'react'
import { Button } from '@/components/ui/button'
import { HiCheck, HiX } from 'react-icons/hi'

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
}

const PriceCard: React.FC<PriceCardProps> = ({
  title,
  price,
  features,
  buttonText,
  subText,
  isPro = false
}) => {
  return (
    <div className={`rounded-[10px] p-[30px] w-full md:w-[21.875rem] min-h-[24.375rem] ${
      isPro ? 'bg-[#D2F2E2]' : 'bg-white border border-[rgba(6,32,19,0.2)]'
    }`}>
      <h3 className="text-[28px] md:text-[32px] font-semibold mb-[30px]">
        {title} {price}
      </h3>
      <div className="space-y-4 mb-[30px]">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            {feature.included ? (
              <HiCheck className="text-primary" size={20} />
            ) : (
              <HiX className="text-secondary/20" size={20} />
            )}
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant={isPro ? 'default' : 'outline'} className="w-full">
          {buttonText}
        </Button>
        <span className="text-sm text-secondary/60">{subText}</span>
      </div>
    </div>
  )
}

const PricePlans = () => {
  const plans = [
    {
      title: 'Free',
      features: [
        { text: '10 exports/day', included: true },
        { text: 'Basic formats', included: true },
        { text: 'No support', included: false }
      ],
      buttonText: 'Get Started',
      subText: 'No credit card needed'
    },
    {
      title: 'Pro',
      price: '($5/Month)',
      features: [
        { text: 'Unlimited exports', included: true },
        { text: 'Google Drive Sync', included: true },
        { text: 'Priority Help', included: true }
      ],
      buttonText: 'Start Free Trial',
      subText: '7 days free • Cancel anytime',
      isPro: true
    }
  ]

  return (
    <section id="price-plans" className="py-[50px] md:py-[100px]">
      <div className='container-custom'>
        <h2 className='text-[40px] md:text-[55px] font-semibold text-center mb-[30px]'>
          Unlock <span className='text-primary'>Productivity</span>
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-[30px] max-w-[21.875rem] md:max-w-none mx-auto">
          {plans.map((plan, index) => (
            <PriceCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricePlans
