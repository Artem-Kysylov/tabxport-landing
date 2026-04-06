import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter } from "./fonts";

import { Toaster } from "sonner";
import { ProProvider } from "@/contexts/ProContext";
import { ProLifetimeBadge } from "@/components/ui/ProLifetimeBadge";

// Import components 
import NavbarWrapper from "@/components/layout/navbar/NavbarWrapper";
import GlobalAnnouncementBar from "@/components/layout/announcement/GlobalAnnouncementBar";
import FooterWrapper from "@/components/layout/footer/FooterWrapper";

export const metadata: Metadata = {
  title: "TableXport: Export tables from ChatGPT to Excel in 1 click",
  description: "Export tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
  keywords: "ChatGPT export, table export, Excel export, CSV export, Google Sheets, AI chat export, Claude export, Gemini export, data export",

  verification: {
    google: 'yKwtmSMlcL6XYe0jkxbHW9kilWaESWjqHOBphH9EI8A',
  },
  
  // PWA Configuration
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'TableXport',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: '/icons/app-icons/apple-touch-icon.png',
  },
  
  // Open Graph метатеги
  openGraph: {
    title: "TableXport: Export tables from ChatGPT to Excel in 1 click",
    description: "Export tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
    url: "https://tablexport.com",
    siteName: "TableXport",
    images: [
      {
        url: "https://tablexport.com/open-graph.png",
        width: 1200,
        height: 630,
        alt: "TableXport - Export tables from AI chats",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Twitter Card метатеги
  twitter: {
    card: "summary_large_image",
    title: "TableXport: Export tables from ChatGPT to Excel in 1 click",
    description: "Export tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
    images: ["https://tablexport.com/open-graph.png"],
  },
  
  // Дополнительные метатеги
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URL
  alternates: {
    canonical: "https://tablexport.com",
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/app-icons/apple-touch-icon.png" />
      </head>
      <body className="font-inter flex flex-col min-h-screen">
        <ProProvider>
          <GlobalAnnouncementBar />
          <NavbarWrapper />
          {children}
          <FooterWrapper />
          <ProLifetimeBadge />
          <Toaster 
            position="bottom-center" 
            richColors 
            toastOptions={{
              className:
                'py-5 px-8 min-w-[340px] sm:min-w-[420px] text-[20px] font-bold text-center items-center',
              descriptionClassName: 'text-[20px] font-bold text-center',
            }}
          />
        </ProProvider>
      </body>
    </html>
  );
}
