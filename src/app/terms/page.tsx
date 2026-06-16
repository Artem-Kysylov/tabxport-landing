import React from 'react'
import Link from 'next/link'

const TermsOfService = () => {
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
          <h1 className="text-4xl md:text-5xl font-semibold mb-8">Terms of Service</h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none [&>h2]:text-[25px] [&>h2]:font-semibold [&>h2]:mt-[30px]">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p>TableXport is owned and operated by Spendly.</p>

            <h2>1. Agreement to Terms</h2>
            <p>
              By using TableXport, you agree to these terms. If you do not agree, please do not use the service.
            </p>

            <h2>2. Merchant of Record</h2>
            <p>
              Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service for returns and handles all billing and payment inquiries.
            </p>

            <h2>3. License & Usage</h2>
            <ul>
              <li>
                <strong>1-Year Pass ($19):</strong> A one-time payment grants you a non-transferable license to use TableXport Pro features for 12 months from the date of purchase.
              </li>
              <li>
                <strong>Pro Lifetime ($29):</strong> A one-time payment grants you a non-transferable license to use TableXport Pro features for the lifetime of the product, with no expiration date.
              </li>
              <li>
                <strong>AI Platforms:</strong> TableXport is an independent tool and is not affiliated with OpenAI, Anthropic, or Google. You are responsible for complying with the terms of the platforms you copy data from.
              </li>
            </ul>

            <h2>4. Limitation of Liability</h2>
            <p>
              TableXport is provided "as is". We are not responsible for inaccuracies in AI-generated data or any data loss during the export process.
            </p>

            <h2>5. Termination</h2>
            <p>
              We reserve the right to terminate access for users who attempt to reverse-engineer the service or bypass payment systems.
            </p>

            <h2>6. Governing Law</h2>
            <p>
              These terms are governed by the laws of Ukraine.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TermsOfService