'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedSection, StaggerContainer, FadeInUp } from '@/components/animations';

const CHROME_WEB_STORE_URL =
  'https://chromewebstore.google.com/detail/tablexport-ai-table-extra/bcbjkpalaglbclfhidoknmngpmdmafgm' as const;
const FIREFOX_AMO_URL =
  'https://addons.mozilla.org/en-US/firefox/addon/tablexport-ai-table-extractor/' as const;

interface ExtensionItem {
  name: string;
  subtitle: string;
  description: string;
  iconSrc: string;
  storeUrl?: string;
  ctaLabel?: string;
}

interface ExtensionCardProps extends ExtensionItem {}

const ExtensionCard: React.FC<ExtensionCardProps> = ({
  name,
  subtitle,
  description,
  iconSrc,
  storeUrl,
  ctaLabel = 'Get extension',
}) => {
  return (
    <FadeInUp className="h-full">
      <div className="flex h-full flex-col items-center text-center bg-white rounded-[10px] py-[30px] px-[30px] md:px-[25px] shadow-none hover:scale-105 transition-transform duration-300">
        <Image
          src={iconSrc}
          alt={`${name} icon`}
          width={48}
          height={48}
          className="mb-4 h-12 w-12 shrink-0 object-contain"
        />

        <div className="flex min-h-0 flex-1 flex-col items-center gap-3 w-full">
          <div className="text-center shrink-0">
            <h3 className="text-xl md:text-[22px] font-semibold text-slate-900 mb-1">{name}</h3>
            <p className="text-sm font-medium text-slate-500">{subtitle}</p>
          </div>
          <p className="text-base md:text-[1.0625rem] text-slate-600 leading-relaxed flex-1 w-full">
            {description}
          </p>

          {storeUrl ? (
            <Link
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto shrink-0 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-auto shrink-0 px-4 py-2 border border-slate-300 text-slate-500 text-sm font-medium rounded-lg bg-transparent cursor-not-allowed hover:border-slate-400 transition-colors"
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </FadeInUp>
  );
};

const Extensions = () => {
  const extensions: ExtensionItem[] = [
    {
      name: 'Chrome Web Store',
      subtitle: 'Your primary data tool',
      description:
        'Export tables directly from ChatGPT, Claude, and the web without broken formatting or manual cleanup.',
      iconSrc: '/icons/chrome-modern-.svg',
      storeUrl: CHROME_WEB_STORE_URL,
      ctaLabel: 'Add to Chrome',
    },
    {
      name: 'Firefox Add-ons',
      subtitle: 'Privacy-focused workflow',
      description:
        'Powerful table parsing for those who value security and a clean browsing experience.',
      iconSrc: '/icons/firefox-6.svg',
      storeUrl: FIREFOX_AMO_URL,
      ctaLabel: 'Add to Firefox',
    },
    /*
    {
      name: 'Microsoft Edge',
      subtitle: 'The Business standard',
      description:
        'Seamless integration for professional PDF reports and deep data analysis in Edge.',
      iconSrc: '/icons/microsoft-edge-1.svg',
    },
    {
      name: 'Raycast Store',
      subtitle: 'For Power Users',
      description:
        'The fastest way to transform text into clean CSV files without leaving your keyboard.',
      iconSrc: '/icons/raycast.svg',
    },
    */
  ];

  return (
    <AnimatedSection>
      <section className="bg-[#D2F2E2] py-[50px] px-5 md:p-[50px] mt-[120px] md:mt-[140px]">
        <div className="container-custom">
          <div className="flex flex-col items-center">
            <FadeInUp>
              <h2 className="text-[42px] md:text-[56px] font-semibold text-center mb-[30px] leading-tight">
                Built Around Your{' '}
                <span className="text-primary">Workflow</span>
              </h2>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <p className="text-center mb-[30px] max-w-[640px] text-lg md:text-xl leading-relaxed text-secondary/90">
                TableXport integrates seamlessly into your existing tools and workflows across all platforms.
              </p>
            </FadeInUp>

            <StaggerContainer
              className="grid grid-cols-1 md:grid-cols-2 gap-[30px] w-full max-w-3xl items-stretch mx-auto"
              itemClassName="h-full"
            >
              {extensions.map((extension) => (
                <ExtensionCard
                  key={extension.iconSrc}
                  name={extension.name}
                  subtitle={extension.subtitle}
                  description={extension.description}
                  iconSrc={extension.iconSrc}
                  storeUrl={extension.storeUrl}
                  ctaLabel={extension.ctaLabel}
                />
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
};

export default Extensions;