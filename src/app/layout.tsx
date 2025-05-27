import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";

// Import components 
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: "TabXport: Export tables from ChatGPT to Excel in 1 click",
  description: "Download tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
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
        <Footer />
      </body>
    </html>
  );
}
