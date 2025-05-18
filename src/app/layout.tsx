import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import components 
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/footer/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TabXport: Export tables from ChatGPT to Excel in 1 click",
  description: "Download tables from ChatGPT, Claude, and other AI chats to Excel, CSV, or Google Sheets. No more manual copying — just click Export!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Navbar />
          {children}
        <Footer />
      </body>
    </html>
  );
}
