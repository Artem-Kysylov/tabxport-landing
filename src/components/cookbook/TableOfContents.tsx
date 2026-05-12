'use client';

import { useEffect, useState } from 'react';
import { CookbookTableOfContents } from '@/types/cookbook';

interface TableOfContentsProps {
  headings: CookbookTableOfContents[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside aria-label="On this page">
      <div className="rounded-xl border border-primary-light/50 bg-white/60 p-6 backdrop-blur-sm">
        <h3 id="cookbook-toc-heading" className="mb-4 text-lg font-semibold text-secondary">Table of Contents</h3>
        <nav aria-labelledby="cookbook-toc-heading">
          <ul className="space-y-2">
            {headings.map(({ id, title, level }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`
                    block text-sm transition-colors duration-200 hover:text-primary
                    ${level === 2 ? 'font-medium' : 'font-normal text-secondary/70'}
                    ${level === 3 ? 'ml-3' : ''}
                    ${level === 4 ? 'ml-6' : ''}
                    ${level >= 5 ? 'ml-9' : ''}
                    ${activeId === id ? 'text-primary font-medium' : 'text-secondary/80'}
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(id);
                    if (element) {
                      element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }
                  }}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}