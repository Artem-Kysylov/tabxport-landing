import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface MdxCtaProps {
  href: string;
  children: React.ReactNode;
}

export function MdxCta({ href, children }: MdxCtaProps) {
  return (
    <div className="not-prose my-12 flex justify-center">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-center text-[17px] font-semibold text-white no-underline shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:text-white hover:shadow-lg hover:shadow-primary/30 hover:no-underline active:translate-y-0 [&_.lucide]:shrink-0 [&_.lucide]:text-white [&_p]:m-0 [&_p]:inline [&_p]:text-[17px] [&_p]:font-semibold [&_p]:leading-snug [&_p]:text-white"
      >
        <span className="inline text-white [&_p]:inline [&_p]:text-white">{children}</span>
        <ArrowRight size={18} className="shrink-0 text-white" aria-hidden="true" />
      </a>
    </div>
  );
}
