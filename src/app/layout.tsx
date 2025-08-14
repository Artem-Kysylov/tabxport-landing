import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";

// Import components 
import Navbar from "@/components/layout/navbar/Navbar";
import FooterWrapper from "@/components/layout/footer/FooterWrapper";

export const metadata: Metadata = {
  title: "TableXport: Export tables from ChatGPT to Excel in 1 click",
  description: "Export tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
  keywords: "ChatGPT export, table export, Excel export, CSV export, Google Sheets, AI chat export, Claude export, Gemini export, data export",
  
  // Open Graph метатеги
  openGraph: {
    title: "TableXport: Export tables from ChatGPT to Excel in 1 click",
    description: "Export tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
    url: "https://tablexport.com",
    siteName: "TableXport",
    images: [
      {
        url: "https://tablexport.com/open-graph.png", // ✅ Изменено с og-image.jpg на open-graph.png
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
    images: ["https://tablexport.com/open-graph.png"], // ✅ Изменено с og-image.jpg на open-graph.png
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter">
        <Navbar />
        {children}
        <FooterWrapper />
      </body>
    </html>
  );
}
