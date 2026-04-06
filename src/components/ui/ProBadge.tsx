'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface ProBadgeProps {
  variant?: 'badge' | 'icon';
  size?: number;
  className?: string;
}

export function ProBadge({ variant = 'badge', size = 16, className = '' }: ProBadgeProps) {
  if (variant === 'icon') {
    return (
      <Lock 
        size={size} 
        className={`text-primary ${className}`}
        aria-label="Pro feature"
      />
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold ${className}`}
      aria-label="Pro feature"
    >
      <Lock size={12} />
      <span>PRO</span>
    </span>
  );
}
