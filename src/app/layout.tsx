import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";

// Import components 
import Navbar from "@/components/layout/navbar/Navbar";
import FooterWrapper from "@/components/layout/footer/FooterWrapper";

export const metadata: Metadata = {
  title: "TableXport: Export tables from ChatGPT to Excel in 1 click",
  description: "Export tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
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
