import React from 'react'
import Link from 'next/link'

const RefundPolicy = () => {
  return (
    <main className="flex flex-col py-[60px] flex-1">
      <div className="container-custom flex-1">
        <div className="flex flex-col gap-8 h-full">
          {/* Back to Home */}
          <Link 
            href="/" 
            className="text-primary hover:text-primary/80 transition-colors duration-300 inline-flex items-center gap-2"
          >
            ← Back to Home
          </Link>

          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-semibold mb-8">Refund Policy</h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none [&>h2]:text-[25px] [&>h2]:font-semibold [&>h2]:mt-[30px] flex-1">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <p>
              14-day money-back guarantee. Full refund within 14 days of purchase for any reason. Contact{' '}
              <a
                href="mailto:hello@tablexport.com"
                className="text-primary hover:text-primary/80"
                title="Contact us at hello@tablexport.com"
              >
                hello@tablexport.com
              </a>{' '}
              for support.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RefundPolicy