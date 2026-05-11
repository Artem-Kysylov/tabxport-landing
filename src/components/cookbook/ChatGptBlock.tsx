import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatGptBlockProps {
  children: React.ReactNode;
}

export function ChatGptBlock({ children }: ChatGptBlockProps) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      {/* Header — mimics ChatGPT output label */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 bg-[#ececec] px-4 py-2.5">
        <Sparkles
          size={13}
          strokeWidth={2}
          className="shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <span className="select-none text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">
          AI Output
        </span>
      </div>

      {/* Body */}
      <div className="bg-[#f7f7f8] px-5 py-4 text-[15px] leading-[1.72] text-slate-700 [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&_code]:rounded [&_code]:bg-slate-200/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em] [&_code]:text-slate-800">
        {children}
      </div>
    </div>
  );
}
