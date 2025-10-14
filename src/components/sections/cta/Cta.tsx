import React from 'react'
import Image from 'next/image'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import ChromeStoreButton from '@/components/ui/chrome-store-button'

const Cta = () => {
  return (
    <AnimatedSection scale={0.95}>
      <section className="relative h-[700px] flex flex-col items-center justify-center">
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
          <h2 className='text-[55px] font-semibold text-center mb-[30px]'>
            Ready to Save <span className='text-primary'>5+ Hours Every Week?</span>
          </h2>
        </FadeInUp>
        
        <FadeInUp delay={0.3}>
          <div className='flex flex-col items-center gap-4'>
            <ChromeStoreButton className="w-[260px] flex items-center gap-2 hover:scale-105 transition-transform duration-200"
              storeUrl="https://chromewebstore.google.com/detail/tablexport/bcbjkpalaglbclfhidoknmngpmdmafgm?hl=ru&authuser=0"
            >
              Install TableXport – Free
            </ChromeStoreButton>
            <span className='text-sm'>30-second install. Trusted by analysts & marketers.</span>
          </div>
        </FadeInUp>
      </section>
    </AnimatedSection>
  )
}

export default Cta