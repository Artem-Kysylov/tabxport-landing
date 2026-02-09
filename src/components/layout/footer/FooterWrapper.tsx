'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  const isWaitlistPage = pathname === '/waitlist';

  if (isWaitlistPage) return null;
  return <Footer />;
}