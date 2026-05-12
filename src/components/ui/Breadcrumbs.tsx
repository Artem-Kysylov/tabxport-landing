'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tablexport.com'}${item.href}` }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`w-full max-w-full text-sm text-secondary/70 ${className}`}
      >
        <ol className="flex w-full flex-col gap-0 md:flex-row md:flex-wrap md:items-center md:gap-0">
          {items.map((item, index) => (
            <li
              key={index}
              className={`flex min-w-0 items-center ${
                index > 0
                  ? 'border-t border-slate-200/70 pt-2.5 mt-2.5 md:border-0 md:pt-0 md:mt-0'
                  : ''
              }`}
            >
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className="mx-2 hidden shrink-0 text-secondary/40 md:inline"
                  aria-hidden="true"
                />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="break-words hover:text-primary transition-colors duration-200 hover:underline"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="break-words font-medium text-secondary"
                  itemProp="name"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}