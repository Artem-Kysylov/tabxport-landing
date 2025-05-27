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

            <h2>1. Information We Collect</h2>
            <p>
            TabXport processes only the text of tables (e.g., in Markdown or CSV format) that you explicitly select in the web interfaces of supported AI platforms. This data is processed locally in your browser and is not collected, stored, or transmitted to any servers controlled by TabXport.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
            The selected table data is used solely to:
            </p>
            <ul>
              <li>Export to Excel files, which are generated locally and downloaded to your device.</li>
              <li>Export to Google Sheets, using Google API with your explicit consent via OAuth 2.0 authentication.</li>
            </ul>

            <h2>3. Third-Party Services</h2>
            <p>
                TabXport integrates with Google Sheets via Google API. When you choose to export a table to Google Sheets:
            </p>
            <ul>
              <li>You authenticate using Google's OAuth 2.0, which requires your explicit consent.</li>
              <li>TabXport accesses only the minimum necessary permissions to create or edit Google Sheets.</li>
              <li>No table data is shared with or stored by TabXport or any other third parties.</li>
            </ul>    
            <h2>4. Data Storage and Retention</h2>
            <p>
                TabXport does not store any data. All processing occurs locally in your browser, and table data is discarded after the export is complete (to Excel or Google Sheets). We do not maintain any databases or logs of your data.
            </p>

            <h2>5. User Responsibilities</h2>
            <p>
            You are responsible for the content of the tables you export using TabXport. Ensure that the data you select does not include personal or sensitive information unless you have the legal right to process it. TabXport is not liable for the content of exported data.
            </p>

            <h2>6. Compliance with Laws</h2>
            <p>
                TabXport complies with applicable privacy laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Since no personal data is collected or stored, TabXport minimizes privacy risks. If you are a user in the EU or California, you have rights under GDPR/CCPA, such as the right to access or delete data; however, as no data is collected, these rights are not applicable.
            </p>
            <h2>7. Changes to This Policy</h2>
            <p>
            We may update this Privacy Policy to reflect changes in TabXport's functionality or legal requirements. The latest version will be posted at [insert link to website/GitHub] with the updated date. Please check periodically for updates.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:tabxport@gmail.com" className="text-primary hover:text-primary/80">
                tabxport@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PrivacyPolicy 