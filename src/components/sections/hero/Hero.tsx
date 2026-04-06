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
                The Ultimate <span className='text-primary'>AI Table Converter & Editor</span>
              </h1>
            </FadeInUp>
            
            <FadeInUp delay={0.4} className='standalone-hero-copy'>
              <div className='flex flex-col items-center gap-3'>
                <p className='text-center font-normal max-w-3xl'>
                  Stop wrestling with AI formatting. Paste any ChatGPT or Claude table, edit it live, brand your PDFs, and export to Excel or Google Drive in seconds.
                </p>
                <Link
                  href='/#demo'
                  className='text-sm md:text-base text-secondary/70 transition-colors duration-300 ease-in-out hover:text-primary'
                >
                  See how it works →
                </Link>
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