'use client';

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { SmartDropzone } from '@/components/UniversalConverter/SmartDropzone'
import { TablePreview } from '@/components/UniversalConverter/TablePreview'
import { useTableParser } from '@/hooks/useTableParser'

const RATED_STORAGE_KEY = 'tablexport_rated' as const

/** Placeholders — replace YOUR_* with real store IDs/slugs. */
const CHROME_WEBSTORE_REVIEWS_URL =
  'https://chromewebstore.google.com/detail/YOUR_ID/reviews' as const
const FIREFOX_AMO_ADDON_URL =
  'https://addons.mozilla.org/en-US/firefox/addon/YOUR_SLUG/' as const
const EDGE_ADDONS_DETAIL_URL =
  'https://microsoftedge.microsoft.com/addons/detail/YOUR_EDGE_ID' as const

function getExtensionReviewUrl(): string {
  if (typeof navigator === 'undefined') return CHROME_WEBSTORE_REVIEWS_URL
  const ua = navigator.userAgent
  if (/Edg/i.test(ua)) return EDGE_ADDONS_DETAIL_URL
  if (/Firefox/i.test(ua)) return FIREFOX_AMO_ADDON_URL
  if (/Chrome/i.test(ua) && !/Edg|OPR/i.test(ua)) return CHROME_WEBSTORE_REVIEWS_URL
  return CHROME_WEBSTORE_REVIEWS_URL
}

function persistRatedAndDismiss(onDismiss: () => void): void {
  try {
    localStorage.setItem(RATED_STORAGE_KEY, 'true')
  } catch {
    // ignore
  }
  onDismiss()
}

/**
 * Bottom-left chip; PWA install prompt is fixed bottom-right (see PWAInstallPrompt.tsx).
 */
function ExtensionRatingBanner({ onDismiss }: { readonly onDismiss: () => void }) {
  const handleRateNow = (): void => {
    try {
      localStorage.setItem(RATED_STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    window.open(getExtensionReviewUrl(), '_blank', 'noopener,noreferrer')
    onDismiss()
  }

  return (
    <motion.div
      role="region"
      aria-label="Rate TableXport extension"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed bottom-4 left-4 z-50 w-[calc(100vw-32px)] max-w-[380px] rounded-lg bg-primary p-4 text-primary-foreground shadow-[0_10px_40px_-12px_rgba(6,32,19,0.35)]"
    >
      <p className="text-sm font-medium leading-snug">
        Loving the extension? ⭐️ Rate us to help us grow!
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleRateNow}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Rate Now
        </button>
        <button
          type="button"
          onClick={() => persistRatedAndDismiss(onDismiss)}
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-white/50 bg-transparent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Later
        </button>
      </div>
    </motion.div>
  )
}

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
  const [showExtensionRatingBanner, setShowExtensionRatingBanner] = useState(false);

  // Runs before auto-paste effect so URL params are still intact when autoPaste strips only itself.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('exportSource') !== 'extension') return;
      if (localStorage.getItem(RATED_STORAGE_KEY) === 'true') return;
      setShowExtensionRatingBanner(true);
    } catch {
      // ignore
    }
  }, []);

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
            
            // 3. Remove autoPaste only so exportSource (e.g. rating banner) stays in the bar until user navigates
            urlParams.delete('autoPaste');
            const qs = urlParams.toString();
            const newUrl = qs
              ? `${window.location.pathname}?${qs}`
              : window.location.pathname;
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
      <AnimatePresence>
        {showExtensionRatingBanner ? (
          <ExtensionRatingBanner
            key="extension-rating"
            onDismiss={() => setShowExtensionRatingBanner(false)}
          />
        ) : null}
      </AnimatePresence>
    </AnimatedSection>
  )
}

export default Hero