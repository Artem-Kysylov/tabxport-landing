'use client';

import React from 'react';
import { Medal } from 'lucide-react';
import { usePro } from '@/contexts/ProContext';

export function ProLifetimeBadge() {
  const { isPro, isLoading } = usePro();

  if (isLoading || !isPro) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
      <div className="group inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-2 text-xs font-semibold text-secondary shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-md">
        <Medal size={16} className="text-primary" />
        <span>Pro Lifetime</span>
      </div>
    </div>
  );
}
