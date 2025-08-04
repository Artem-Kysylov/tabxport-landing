'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  const isPaymentPage = pathname === '/payment';
  
  if (isPaymentPage) return null;
  return <Footer />;
}