'use client';

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { SmartDropzone } from '@/components/UniversalConverter/SmartDropzone'
import { TablePreview } from '@/components/UniversalConverter/TablePreview'
import { useTableParser } from '@/hooks/useTableParser'

function sanitizeMarkdown(text: string): string {
  let cleaned = text
  cleaned = cleaned.replace(/```[\w-]*\s*\n?[\s\S]*?```/g, '')
  cleaned = cleaned.replace(/`{3,}/g, '')
  cleaned = cleaned.replace(/\*\*([\s\S]+?)\*\*/g, '$1')
  cleaned = cleaned.replace(/\*([^*\n]+?)\*/g, '$1')
  return cleaned.trim()
}

const Hero = () => {
  const { parsedTables, isLoading, error, parseFromText, appendFromText, clearTable } = useTableParser();

  // Logic for auto-pasting from clipboard
  useEffect(() => {
    const handleAutoPaste = async () => {
      // Ensure this runs only in the browser (client-side)
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.get('autoPaste') === 'true') {
        try {
          // 1. Read data from the clipboard
          const clipboardData = await navigator.clipboard.readText();
          
          if (clipboardData) {
            // 2. Feed the data to the parser
            parseFromText(sanitizeMarkdown(clipboardData));
            
            // 3. Clean up the URL to prevent re-pasting on page reload
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        } catch (err) {
          console.error("Failed to read clipboard for auto-paste:", err);
        }
      }
    };

    handleAutoPaste();
  }, [parseFromText]);

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
                    onDataReceived={(data) => parseFromText(sanitizeMarkdown(data))}
                    isProcessing={isLoading}
                    errorMessage={error}
                  />
                ) : (
                  <TablePreview 
                    tables={parsedTables}
                    onClear={clearTable}
                    onAppend={(data) => appendFromText(sanitizeMarkdown(data))}
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