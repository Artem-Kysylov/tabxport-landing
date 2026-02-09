import Link from 'next/link'

const GlobalAnnouncementBar = () => {
  return (
    <div className="sticky top-0 z-40 w-full bg-[#0f172a]">
      <div className="container-custom flex h-9 items-center justify-center px-4 text-xs text-white sm:h-10 sm:text-sm">
        <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
          <span className="hidden sm:inline">Meet Spendly — my new personal finance app for creators.</span>
          <span className="sm:hidden">Meet Spendly — my new finance app.</span>
          <Link
            href="https://getspendly.net/en"
            className="font-medium text-[#3559E0] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check it out →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default GlobalAnnouncementBar
