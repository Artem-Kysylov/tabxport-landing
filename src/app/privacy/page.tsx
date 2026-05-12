import React from 'react'
import Link from 'next/link'

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl md:text-5xl font-semibold mb-8">Privacy Policy</h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none [&>h2]:text-[25px] [&>h2]:font-semibold [&>h2]:mt-[30px]">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <h2>1. Who We Are</h2>
            <p>
              TableXport ("we", "our", "us") provides tools to export and format tables from AI platforms. Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders.
            </p>

            <h2>2. Information We Collect</h2>
            <ul>
              <li>
                <strong>Table Data:</strong> Anonymous exports are processed in real time in your browser and are not stored on our servers. If you sign in and use the optional Export History feature, limited table-related data may be stored as described in section 3.
              </li>
              <li>
                <strong>Payment Data:</strong> We do not collect or store credit card details. All payments are processed securely by Paddle.
              </li>
              <li>
                <strong>Account Data:</strong> If you sign in via Google, we collect your email address and name to manage your Pro subscription via Supabase.
              </li>
            </ul>

            <h2>3. Data Storage & Security (Export History)</h2>
            <p>
              Export History is optional and only applies when you are signed in and choose to save exports for later. We aim to be transparent about what is stored and how it is protected.
            </p>
            <ul>
              <li>
                <strong>Purpose:</strong> We store only table data, source URLs, and cleanup statistics for accounts that use Export History—nothing beyond what the feature needs to show your saved exports.
              </li>
              <li>
                <strong>Security:</strong> Storage runs on Supabase with Row Level Security (RLS). Your data is isolated and strictly accessible only by you. No one else, including Syntax Labs staff, can read your table contents.
              </li>
              <li>
                <strong>Your control:</strong> Deleting an entry from your Export History dashboard removes it permanently from our database. We do not keep hidden or parallel backups of data you delete.
              </li>
              <li>
                <strong>Anonymous exports:</strong> If you are not logged in, exports are handled in real time and are not written to our servers.
              </li>
              <li>
                <strong>Feature voting:</strong> Feature requests and votes are stored anonymously—via your browser (such as localStorage) and public identifiers—to help us prioritize improvements without linking activity to your identity.
              </li>
            </ul>

            <h2>4. Google API Disclosure</h2>
            <p>
              TableXport's use and transfer of information received from Google APIs to any other app will adhere to{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <ul>
              <li>We use <strong>Google Drive/Sheets API</strong> solely to export tables at your request.</li>
              <li>We do not share this data with third parties or use it for AI model training.</li>
            </ul>

            <h2>5. Third-Party Services</h2>
            <p>
              We use Paddle for payments and Supabase for authentication and optional Export History storage (see section 3). Each service has its own privacy policy.
            </p>

            <h2>6. Contact</h2>
            <p>
              <a
                href="mailto:hello@tablexport.com"
                className="text-primary hover:text-primary/80"
                title="Contact us at hello@tablexport.com"
              >
                hello@tablexport.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PrivacyPolicy