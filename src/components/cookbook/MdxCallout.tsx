import React from 'react';
import { Lightbulb, AlertTriangle, Info } from 'lucide-react';

type CalloutType = 'tip' | 'warning' | 'info';

interface MdxCalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

const variants = {
  tip: {
    Icon: Lightbulb,
    label: 'Pro Tip',
    wrapper: 'border-primary/20 bg-primary/[0.035]',
    badge: 'text-primary/90 bg-primary/[0.08]',
    iconColor: 'text-primary/70',
  },
  warning: {
    Icon: AlertTriangle,
    label: 'Heads Up',
    wrapper: 'border-amber-200 bg-amber-50/60',
    badge: 'text-amber-700 bg-amber-100',
    iconColor: 'text-amber-500',
  },
  info: {
    Icon: Info,
    label: 'Note',
    wrapper: 'border-sky-200/70 bg-sky-50/50',
    badge: 'text-sky-700 bg-sky-100',
    iconColor: 'text-sky-500',
  },
} as const;

export function MdxCallout({ type = 'tip', children }: MdxCalloutProps) {
  const { Icon, label, wrapper, badge, iconColor } = variants[type];

  return (
    <div className={`not-prose my-8 rounded-xl border px-6 py-5 ${wrapper}`}>
      <div
        className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${badge}`}
      >
        <Icon size={11} className={`shrink-0 ${iconColor}`} aria-hidden="true" />
        {label}
      </div>
      <div
        className="
          text-[16px] leading-relaxed text-secondary/85
          [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_p]:text-[16px] [&_p]:leading-relaxed [&_p]:text-secondary/85
          [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
          [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5
          [&_li]:text-[16px] [&_li]:leading-relaxed [&_li]:text-secondary/85
          [&_strong]:font-semibold [&_strong]:text-secondary
          [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
          [&_code]:rounded [&_code]:border [&_code]:border-slate-200 [&_code]:bg-slate-100/80
          [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.88em] [&_code]:font-medium [&_code]:text-secondary/90
        "
      >
        {children}
      </div>
    </div>
  );
}
