import React from 'react'
import Image from 'next/image'
import { MonitorSmartphone } from 'lucide-react'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { InstallAppButton } from '@/components/pwa/InstallAppButton'

const Cta = () => {
  return (
    <AnimatedSection scale={0.95}>
      <section className="relative min-h-[620px] flex flex-col items-center justify-center py-[80px]">
        <div className='absolute top-0 left-0 w-full h-full -z-10'>
          <Image 
            src="/bg.png"
            alt="background"
            fill
            className='object-cover object-top'
            sizes="100vw"
            quality={90}
          />
        </div>
        
        <FadeInUp>
          <div className='flex flex-col items-center gap-5 text-center px-5'>
            <div className='w-[72px] h-[72px] rounded-full bg-white/80 flex items-center justify-center text-primary shadow-[0_10px_30px_rgba(27,147,88,0.18)]'>
              <MonitorSmartphone size={34} />
            </div>
            <h2 className='text-[40px] md:text-[55px] font-semibold leading-tight'>
              Get TableXport <span className='text-primary'>on all your devices</span>
            </h2>
          </div>
        </FadeInUp>
        
        <FadeInUp delay={0.3}>
          <div className='flex flex-col items-center gap-4 max-w-[640px] px-5'>
            <p className='text-center text-secondary/80'>
              Works on Mac, Windows, iOS, and Android. No App Store needed. Just click Install and take your AI tables everywhere.
            </p>
            <InstallAppButton
              className='w-[260px] px-5 py-5 rounded-[8px] bg-primary text-white font-bold shadow-primary-btn transition-all duration-200 ease-out hover:-translate-y-px hover:scale-105 hover:bg-primary/90 hover:text-white hover:shadow-primary-btn-hover'
              label='Install TableXport'
            />
            <span className='text-sm text-secondary/65'>iOS user? Tap Share, then Add to Home Screen.</span>
          </div>
        </FadeInUp>
      </section>
    </AnimatedSection>
  )
}

export default Cta