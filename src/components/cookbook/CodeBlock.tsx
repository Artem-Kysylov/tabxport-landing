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
    <figure className="cookbook-code-figure not-prose my-8 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1117] shadow-[0_2px_8px_rgba(0,0,0,0.22),0_8px_32px_rgba(0,0,0,0.2)]">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-[#161b22] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {/* Traffic lights - subtle dots */}
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="inline-block h-[10px] w-[10px] rounded-full bg-[#ff5f57]/70" />
            <span className="inline-block h-[10px] w-[10px] rounded-full bg-[#febc2e]/70" />
            <span className="inline-block h-[10px] w-[10px] rounded-full bg-[#28c840]/70" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-400/80 select-none">
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
          className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-400 transition-all duration-150 hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-slate-200 active:scale-95"
        >
          {copied ? (
            <>
              <Check size={11} strokeWidth={2.5} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={11} strokeWidth={2} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code area */}
      <div className="cookbook-code-scroll overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <pre
          ref={preRef}
          data-language={language}
          className="m-0 min-w-0 bg-transparent p-5 text-[13px] leading-[1.72] [&>code]:block [&>code]:font-[family-name:var(--font-jetbrains-mono),_'JetBrains_Mono',_ui-monospace,_monospace] [&>code]:text-[13px]"
        >
          {children}
        </pre>
      </div>
    </figure>
  );
}
