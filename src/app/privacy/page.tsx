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
              This Privacy Policy describes how TableXport (“we”, “our”, “us”) handles information when you use the extension.
            </p>

            <h2>2. Information We Collect</h2>
            <ul>
              <li>
                We do not collect or store your table content on our servers. All table processing (e.g., converting to CSV/Excel/Markdown) happens locally in your browser.
              </li>
              <li>
                If you contact us by email, we will receive your email address and the content of your message solely for support and record‑keeping.
              </li>
            </ul>

            <h2>3. How We Use Information</h2>
            <p>The selected table data is used only to perform the action you choose:</p>
            <ul>
              <li>Export to local files (e.g., Excel/CSV/Markdown) generated locally and downloaded to your device.</li>
              <li>Export to Google Sheets at your request.</li>
            </ul>

            <h2>4. Third‑Party Services (Google APIs)</h2>
            <ul>
              <li>When you export to Google Sheets, you authenticate via Google OAuth 2.0 and explicitly grant access.</li>
              <li>We request only the minimal scopes required to create or edit spreadsheets on your behalf.</li>
              <li>The table data you choose to export is sent to Google solely to complete the export action; it is not sent to or stored on our servers.</li>
              <li>
                Limited Use: The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.
              </li>
            </ul>

            <h2>5. Data Storage and Retention</h2>
            <ul>
              <li>We do not maintain databases of your table content.</li>
              <li>Any data processed locally is discarded after the export completes.</li>
              <li>Emails you send to us may be retained as required for support and legal purposes.</li>
            </ul>

            <h2>6. Permissions We Use and Why</h2>
            <p>
              We request only the minimum permissions needed to provide the extension’s functionality. Some permissions may be requested optionally at runtime when you enable a specific feature.
            </p>
            <ul>
              <li>downloads — to save exported files to your device.</li>
              <li>storage — to store user preferences (e.g., export settings) locally in the browser.</li>
              <li>identity — to let you sign in with Google when you choose to export to Google Sheets.</li>
              <li>tabs and host permissions for supported AI platforms — to access page content you explicitly select for export.</li>
              <li>optional host permissions for Google APIs — requested on demand when you enable Google Sheets export.</li>
            </ul>

            <h2>7. Your Responsibilities</h2>
            <p>
              You are responsible for ensuring you have the right to process any personal or sensitive information contained in the tables you export.
            </p>

            <h2>8. Legal Basis and Compliance</h2>
            <p>
              We minimize privacy risks by not collecting or storing table content on our servers. If you contact us, we process your contact details solely to respond to your request. Applicable privacy rights (e.g., GDPR/CCPA) may apply to such contact information; you can reach out to exercise your rights using the contact details below.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Policy to reflect new features or legal requirements. The latest version will be available at our website/GitHub with the updated date.
            </p>

            <h2>10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at:{' '}
              <a
                href="mailto:hello@tablexport.com"
                className="text-primary hover:text-primary/80"
                title="Contact to me directly hello@tablexport.com"
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