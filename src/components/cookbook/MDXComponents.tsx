import React from 'react';
import Link from 'next/link';
import { CodeBlock } from './CodeBlock';
import { ChatGptBlock } from './ChatGptBlock';
import { MdxCta } from './MdxCta';
import { MdxStep } from './MdxStep';
import { MdxCallout } from './MdxCallout';

/**
 * Extracts the language from a rehype-pretty-code <pre> element.
 * rehype-pretty-code sets `data-language` on <pre> after processing.
 */
function extractLanguageFromPre(props: Record<string, unknown>): string | null {
  const lang = props['data-language'];
  return typeof lang === 'string' ? lang : null;
}

const MDXComponents = {
  /**
   * rehype-pretty-code wraps each fenced block in:
   *   <figure data-rehype-pretty-code-figure>
   *     <pre data-language="..." data-theme="..."> <code>…</code> </pre>
   *   </figure>
   *
   * We strip the outer <figure> so our CodeBlock provides the only wrapper.
   */
  figure: ({ children, ...props }: any) => {
    if ('data-rehype-pretty-code-figure' in props) {
      return <>{children}</>;
    }
    return <figure {...props}>{children}</figure>;
  },

  /**
   * <pre> from rehype-pretty-code carries data-language.
   * We render our styled CodeBlock; the children are already highlighted <span>s.
   */
  pre: ({ children, ...props }: any) => {
    const language = extractLanguageFromPre(props);
    if (language !== null) {
      return <CodeBlock language={language}>{children}</CodeBlock>;
    }
    // Fallback for bare <pre> (no language annotation)
    return (
      <CodeBlock language="">{children}</CodeBlock>
    );
  },

  // ── Headings ──────────────────────────────────────────────────────────────

  h1: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 {...props} className="mb-6 scroll-mt-20 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h2
      {...props}
      id={id}
      className="mb-5 mt-14 scroll-mt-20 text-2xl font-bold tracking-tight text-secondary first:mt-0 sm:text-[1.75rem]"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h3
      {...props}
      id={id}
      className="mb-3 mt-10 scroll-mt-20 text-lg font-semibold tracking-tight text-secondary sm:text-xl"
    >
      {children}
    </h3>
  ),
  h4: ({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h4 {...props} id={id} className="mb-3 mt-8 scroll-mt-20 text-base font-semibold text-secondary">
      {children}
    </h4>
  ),
  h5: ({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h5 {...props} id={id} className="mb-2 mt-6 scroll-mt-20 text-sm font-semibold text-secondary">
      {children}
    </h5>
  ),
  h6: ({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
    <h6 {...props} id={id} className="mb-2 mt-6 scroll-mt-20 text-sm font-semibold text-secondary/70">
      {children}
    </h6>
  ),

  // ── Body text ─────────────────────────────────────────────────────────────

  p: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
    <p {...props} className="mb-6 text-[17px] leading-relaxed text-secondary/[0.88] last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children, ...props }: React.HTMLProps<HTMLElement>) => (
    <strong {...props} className="font-semibold text-secondary">
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.HTMLProps<HTMLElement>) => (
    <em {...props} className="italic text-secondary/90">
      {children}
    </em>
  ),

  // ── Links ─────────────────────────────────────────────────────────────────

  a: ({ href, children, ...props }: React.HTMLProps<HTMLAnchorElement>) => {
    if (href?.startsWith('http')) {
      return (
        <a
          {...props}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline decoration-primary/35 underline-offset-[3px] transition-colors hover:text-primary/85 hover:decoration-primary/55"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href || '#'}
        className="font-medium text-primary underline decoration-primary/35 underline-offset-[3px] transition-colors hover:text-primary/85 hover:decoration-primary/55"
      >
        {children}
      </Link>
    );
  },

  // ── Lists ─────────────────────────────────────────────────────────────────

  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul
      {...props}
      className="mb-6 ml-1 list-disc space-y-3 pl-6 text-[17px] leading-relaxed text-secondary/[0.88] marker:text-primary/60"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol
      {...props}
      className="mb-6 ml-1 list-decimal space-y-3 pl-6 text-[17px] leading-relaxed text-secondary/[0.88] marker:font-medium marker:text-secondary/70"
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLProps<HTMLLIElement>) => (
    <li {...props} className="pl-1.5 leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0">
      {children}
    </li>
  ),

  // ── Blockquote → ChatGPT output block ────────────────────────────────────

  blockquote: ({ children }: React.HTMLProps<HTMLQuoteElement>) => (
    <ChatGptBlock>{children}</ChatGptBlock>
  ),

  // ── Inline code ───────────────────────────────────────────────────────────

  /**
   * code component handles ONLY inline code (`backtick`).
   * Fenced blocks (``` ... ```) go through pre → CodeBlock above.
   */
  code: ({ children, ...props }: any) => (
    <code
      {...props}
      className="rounded-md border border-slate-200/90 bg-slate-100/90 px-[5px] py-0.5 font-[family-name:var(--font-jetbrains-mono),_ui-monospace,_monospace] text-[0.86em] font-medium text-secondary/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)]"
    >
      {children}
    </code>
  ),

  // ── Media & tables ────────────────────────────────────────────────────────

  img: ({ alt, src, ...props }: React.HTMLProps<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ''}
      {...props}
      className="my-8 max-w-full rounded-xl border border-slate-200/80 bg-white shadow-sm"
    />
  ),
  table: ({ children, ...props }: React.HTMLProps<HTMLTableElement>) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200/70 bg-white/70 shadow-[0_2px_16px_rgba(6,32,19,0.05)]">
      <table {...props} className="min-w-full border-collapse text-left text-[15px]">
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLProps<HTMLTableCellElement>) => (
    <th
      {...props}
      className="border-b border-slate-200/90 bg-slate-50/95 px-4 py-3 font-semibold text-secondary first:rounded-tl-xl last:rounded-tr-xl"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLProps<HTMLTableCellElement>) => (
    <td {...props} className="border-b border-slate-100 px-4 py-3 text-secondary/85">
      {children}
    </td>
  ),
  hr: () => (
    <div
      role="separator"
      aria-hidden="true"
      className="my-14 h-px"
      style={{
        background:
          'linear-gradient(to right, transparent, rgb(203 213 225 / 0.7) 20%, rgb(203 213 225 / 0.7) 80%, transparent)',
      }}
    />
  ),

  CTA: MdxCta,
  Step: MdxStep,
  Callout: MdxCallout,
};

export default MDXComponents;
