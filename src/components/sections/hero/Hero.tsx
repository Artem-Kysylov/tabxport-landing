'use client';

import React from 'react'
import Link from 'next/link'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { SmartDropzone } from '@/components/UniversalConverter/SmartDropzone'
import { TablePreview } from '@/components/UniversalConverter/TablePreview'
import { useTableParser } from '@/hooks/useTableParser'

const Hero = () => {
  const { parsedTables, isLoading, error, parseFromText, appendFromText, clearTable } = useTableParser();

  return (
    <AnimatedSection className='standalone-hero-shell'>
      <section className='standalone-hero-section'>
        <div className='container-custom standalone-hero-container'>
          <div className='standalone-hero flex flex-col items-center justify-center gap-4 pt-[48px] pb-[24px] md:pt-[60px] md:pb-[32px]'>
            <FadeInUp delay={0.2} className='standalone-hero-copy'>
              <h1 className='text-center text-4xl md:text-5xl font-semibold leading-tight max-w-4xl'>
              From AI to <span className='text-primary'>Google Sheets in 1 Second.</span>
              </h1>
            </FadeInUp>
            
            <FadeInUp delay={0.4} className='standalone-hero-copy'>
              <div className='flex flex-col items-center gap-3'>
                <p className='text-center font-normal max-w-3xl'>
                Don&apos;t wrestle with AI formatting. Paste your table here, edit it live, and export directly to Excel or Google Drive without the cleanup work.
                </p>
              </div>
            </FadeInUp>
            
            <FadeInUp delay={0.6} className="w-full">
              <div id='dropzone'>
                {!parsedTables || parsedTables.length === 0 ? (
                  <SmartDropzone 
                    onDataReceived={parseFromText}
                    isProcessing={isLoading}
                    errorMessage={error}
                  />
                ) : (
                  <TablePreview 
                    tables={parsedTables}
                    onClear={clearTable}
                    onAppend={appendFromText}
                  />
                )}
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default Hero