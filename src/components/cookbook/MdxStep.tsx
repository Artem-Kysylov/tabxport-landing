import React from 'react';

interface MdxStepProps {
  /** Quoted string in MDX (`step="2"`) — bracket expressions often don't reach custom components in MDXRemote. */
  step: string | number;
  title: string;
}

function parseStepIndex(value: string | number | undefined): number {
  if (value === undefined || value === null) return 1;
  const n = typeof value === 'number' ? value : parseInt(String(value).trim(), 10);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function MdxStep({ step, title }: MdxStepProps) {
  const safeStep = parseStepIndex(step);
  const paddedNumber = String(safeStep).padStart(2, '0');

  return (
    <div
      id={`step-${safeStep}`}
      className="not-prose mt-14 mb-6 flex items-start gap-4 scroll-mt-20"
    >
      <span
        className="shrink-0 select-none font-black leading-none tracking-tighter text-primary/[0.09]"
        style={{ fontSize: '3.5rem', lineHeight: 1, transform: 'translateY(2px)' }}
        aria-hidden="true"
      >
        {paddedNumber}
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-secondary sm:text-[1.65rem]">
        {title}
      </h2>
    </div>
  );
}
