'use client';

import React, { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TSX',
  bash: 'Shell',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  sql: 'SQL',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
  markdown: 'Markdown',
  md: 'Markdown',
  python: 'Python',
  py: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  ruby: 'Ruby',
  rb: 'Ruby',
  php: 'PHP',
  text: 'Plain Text',
  txt: 'Plain Text',
};

function getLanguageLabel(lang: string): string {
  const key = lang.toLowerCase();
  return LANGUAGE_LABELS[key] ?? (key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Code');
}

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
}

export function CodeBlock({ language = '', children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const label = getLanguageLabel(language);

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <figure className="cookbook-code-figure not-prose my-8 overflow-hidden rounded-xl border border-slate-200/95 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_14px_rgba(6,32,19,0.06)] ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/90 bg-[#f4f4f5] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-slate-300/90" />
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-slate-300/90" />
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-slate-300/90" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-600 select-none">
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300/90 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,1)] transition-colors hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check size={11} strokeWidth={2.5} className="text-green-600" />
              <span className="text-green-700">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={11} strokeWidth={2} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="cookbook-code-scroll overflow-x-auto border-t border-transparent bg-[#f8fafc] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
        <pre
          ref={preRef}
          data-language={language}
          className="m-0 min-w-0 bg-transparent p-5 text-[13px] leading-[1.72] text-slate-900 [&>code]:block [&>code]:font-[family-name:var(--font-jetbrains-mono),_'JetBrains_Mono',_ui-monospace,_monospace] [&>code]:text-[13px] [&>code]:text-slate-900"
        >
          {children}
        </pre>
      </div>
    </figure>
  );
}
