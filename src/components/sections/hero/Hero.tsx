import React from 'react'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import ChromeStoreButton from '@/components/ui/chrome-store-button'

const Hero = () => {
  return (
    <AnimatedSection>
      <section>
        <div className='container-custom'>
          <div className='flex flex-col items-center justify-center gap-8 pt-[200px]'>
            <FadeInUp delay={0.2}>
              {/* <h1 className='text-center text-7xl font-semibold'>
                <span className='text-primary'>Click. Export. Done.</span> AI Tables → Excel, PDF, Google Sheets
              </h1> */}
              <h1 className='text-center text-7xl font-semibold'>
                <span className='text-primary'>Click. Export. Done.</span> AI Tables → Excel, Docx
              </h1>
            </FadeInUp>
            
            <FadeInUp delay={0.4}>
              <p className='text-center font-normal'>
                Stop wasting hours fixing AI-generated tables.<br /> 
                TableXport converts them in seconds — perfectly formatted, ready to use.
              </p>
            </FadeInUp>
            
            <FadeInUp delay={0.6}>
              <ChromeStoreButton
                className="hover:scale-105 transition-transform duration-200"
                storeUrl="https://chromewebstore.google.com/detail/tablexport/bcbjkpalaglbclfhidoknmngpmdmafgm?hl=ru&authuser=0"
              >
                Add to Chrome - It's free
              </ChromeStoreButton>
            </FadeInUp>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default Hero