import React from 'react'
import Image from 'next/image'
import { AnimatedSection, FadeInUp } from '@/components/animations'

const About = () => {
  return (
    <AnimatedSection>
      <section id="about" className='py-[50px] md:py-[100px]'>
        <div className='container-custom'>
          <div className='flex flex-col md:flex-row items-center justify-center gap-[50px]'>
              <div className='md:w-[50%]'>
                  <FadeInUp>
                    <h2 className='text-[40px] md:text-[55px] font-semibold mb-[30px]'>
                    Hi, I&apos;m Artem — <span className='text-primary'>Creator of TableXport</span>
                    </h2>
                  </FadeInUp>
                  
                  <FadeInUp delay={0.3}>
                    <p className='text-[20px] md:text-[24px]'>
                        I built TableXport after watching myself and my teammates struggle with the same pain:
                        AI-generated tables were always a mess to copy, fix, and organize.

                        What started as a weekend experiment to save my own time quickly grew into a tool used by analysts, marketers, and anyone tired of manual table work.
                        My goal is simple: help you spend less time cleaning tables and more time doing real work.
                    </p>
                  </FadeInUp>
              </div>

              <FadeInUp delay={0.5} className='md:w-[50%] flex justify-center'>
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