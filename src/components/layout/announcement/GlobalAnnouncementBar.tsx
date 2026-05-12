'use client'

import Link from 'next/link'
import { useStandaloneMode } from '@/hooks/useStandaloneMode'

const SPENDLY_WAITLIST_URL = 'https://getspendly.net/en'

const GlobalAnnouncementBar = () => {
  const isStandalone = useStandaloneMode()

  if (isStandalone) return null

  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#020617] backdrop-blur-md supports-[backdrop-filter]:bg-[#020617]/97">
      <div className="container-custom flex min-h-9 flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-2 text-xs text-white/95 sm:min-h-10 sm:text-sm">
        <p className="max-w-[min(100%,52rem)] text-center leading-snug">
          Spendly is evolving. Join the waitlist for the native iOS app coming Summer 2026.
        </p>
        <Link
          href={SPENDLY_WAITLIST_URL}
          className="inline-flex shrink-0 cursor-pointer items-center rounded-[8px] border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors hover:border-white/22 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:text-[13px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join the Waitlist →
        </Link>
      </div>
    </div>
  )
}

export default GlobalAnnouncementBar
