'use client';

import React from 'react'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { SmartDropzone } from '@/components/UniversalConverter/SmartDropzone'
import { TablePreview } from '@/components/UniversalConverter/TablePreview'
import { useTableParser } from '@/hooks/useTableParser'

const Hero = () => {
  const { parsedTable, isLoading, error, parseFromText, clearTable } = useTableParser();

  return (
    <AnimatedSection>
      <section>
        <div className='container-custom'>
          <div className='flex flex-col items-center justify-center gap-8 pt-[200px] pb-[100px]'>
            <FadeInUp delay={0.2}>
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
            
            <FadeInUp delay={0.6} className="w-full">
              {!parsedTable ? (
                <SmartDropzone 
                  onDataReceived={parseFromText}
                  isProcessing={isLoading}
                  errorMessage={error}
                />
              ) : (
                <TablePreview 
                  table={parsedTable}
                  onClear={clearTable}
                />
              )}
            </FadeInUp>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default Hero