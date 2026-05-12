import React from 'react'
import Image from 'next/image'
import { AnimatedSection, FadeInUp } from '@/components/animations'

const About = () => {
  return (
    <AnimatedSection>
      <section id="about" className='py-[50px] md:py-[100px]'>
        <div className='container-custom'>
          <div className='flex flex-col md:flex-row items-center justify-center gap-[50px]'>
              <div className='w-full md:w-[50%]'>
                  <FadeInUp>
                    <h2 className='text-[40px] md:text-[55px] font-semibold mb-[30px]'>
                    Hi, I&apos;m Artem — <span className='text-primary'>Founder of TableXport</span>
                    </h2>
                  </FadeInUp>
                  
                  <FadeInUp delay={0.3}>
                    <p className='text-[20px] md:text-[24px]'>
                        I built TableXport after wasting too many hours fixing broken tables manually. What started as a small personal tool quickly became a workflow used by analysts, marketers, researchers, and power users who wanted cleaner exports with less friction.
                    </p>
                    <p className='text-[20px] md:text-[24px] font-semibold mt-4'>
                        My goal is simple: make messy data actually usable.
                    </p>
                  </FadeInUp>
              </div>

              <FadeInUp delay={0.5} className='w-full md:w-[50%] flex justify-center'>
                <div className='relative w-full max-w-[400px] aspect-square'>
                  <Image 
                    src='/about.png' 
                    alt='Artem - Creator of TableXport'
                    fill
                    className='object-cover rounded-[20px] shadow-lg hover:scale-105 transition-transform duration-300'
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </FadeInUp>
          </div>

        </div>
      </section>
    </AnimatedSection>
  )
}

export default About