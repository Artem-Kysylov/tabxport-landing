import React from 'react'
import Link from 'next/link'

const RefundPolicy = () => {
  return (
    <main className="py-[100px]">
      <div className="container-custom">
        <div className="flex flex-col gap-8">
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
          <div className="prose prose-lg max-w-none [&>h2]:text-[25px] [&>h2]:font-semibold [&>h2]:mt-[30px]">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <h2>1. 14-Day Money-Back Guarantee</h2>
            <p>
              We want you to be happy with TableXport. If the tool doesn't meet your expectations, you can request a full refund within <strong>14 days</strong> of your initial purchase.
            </p>

            <h2>2. How to Request a Refund</h2>
            <p>
              To request a refund, please contact Paddle Customer Service or email us at{' '}
              <a
                href="mailto:hello@tablexport.com"
                className="text-primary hover:text-primary/80"
                title="Contact us at hello@tablexport.com"
              >
                hello@tablexport.com
              </a>
              {' '}with your order ID.
            </p>

            <h2>3. Conditions for Refund</h2>
            <ul>
              <li>The request must be made within 14 days of purchase.</li>
              <li>To prevent abuse, we reserve the right to refuse refunds if a user has performed an excessive number of exports (more than 20) during the trial period.</li>
            </ul>

            <h2>4. Payment Processing</h2>
            <p>
              Refunds are processed by Paddle. Once approved, the funds will be returned to your original payment method within 5-10 business days.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RefundPolicy