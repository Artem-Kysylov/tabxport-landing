'use client';

import React from 'react';
import Image from 'next/image';

interface IconProps {
  size?: number;
  className?: string;
}

export const ExcelIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <Image
    src="/icons/icon-excel.svg"
    alt="Excel"
    width={size}
    height={size}
    className={className}
  />
);

export const CSVIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <Image
    src="/icons/icon-csv.svg"
    alt="CSV"
    width={size}
    height={size}
    className={className}
  />
);

export const DocxIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <Image
    src="/icons/icon-word.svg"
    alt="Word"
    width={size}
    height={size}
    className={className}
  />
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L14.09 8.26L20.5 10.5L14.09 12.74L12 19L9.91 12.74L3.5 10.5L9.91 8.26L12 2Z"
      fill="currentColor"
      className="text-primary"
    />
    <path
      d="M19 15L20.45 18.55L24 20L20.45 21.45L19 25L17.55 21.45L14 20L17.55 18.55L19 15Z"
      fill="currentColor"
      className="text-primary/60"
    />
    <path
      d="M5 15L6.45 18.55L10 20L6.45 21.45L5 25L3.55 21.45L0 20L3.55 18.55L5 15Z"
      fill="currentColor"
      className="text-primary/40"
    />
  </svg>
);
