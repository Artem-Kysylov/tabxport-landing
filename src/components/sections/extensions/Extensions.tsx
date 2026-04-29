'use client';

import React from 'react';
import Image from 'next/image';
import { AnimatedSection, StaggerContainer, FadeInUp } from '@/components/animations';

interface ExtensionCardProps {
  name: string;
  subtitle: string;
  description: string;
  iconSrc: string;
}

const ExtensionCard: React.FC<ExtensionCardProps> = ({ name, subtitle, description, iconSrc }) => {
  return (
    <FadeInUp>
      <div className="flex flex-col items-center text-center bg-white rounded-[10px] py-[30px] px-[30px] md:px-[25px] shadow-none hover:scale-105 transition-transform duration-300">
        <Image
          src={iconSrc}
          alt={`${name} icon`}
          width={48}
          height={48}
          className="mb-4 h-12 w-12 object-contain"
        />
        
        {/* Content */}
        <div className="flex flex-col gap-3 items-center">
          <div className="text-center">
            <h3 className="text-xl md:text-[22px] font-semibold text-slate-900 mb-1">{name}</h3>
            <p className="text-sm font-medium text-slate-500">{subtitle}</p>
          </div>
          <p className="text-base md:text-[1.0625rem] text-slate-600 leading-relaxed">{description}</p>
          
          {/* Coming Soon Button - Ghost/Outline style with gray */}
          <button
            disabled
            className="mt-2 px-4 py-2 border border-slate-300 text-slate-500 text-sm font-medium rounded-lg bg-transparent cursor-not-allowed hover:border-slate-400 transition-colors"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </FadeInUp>
  );
};

const Extensions = () => {
  const extensions = [
    {
      name: 'Chrome Web Store',
      subtitle: 'Your primary data tool',
      description:
        'Export tables from ChatGPT and Claude directly into your workspace without missing a beat.',
      iconSrc: '/icons/chrome-modern-.svg',
    },
    {
      name: 'Firefox Add-ons',
      subtitle: 'Privacy-focused workflow',
      description:
        'Powerful table parsing for those who value security and a clean browsing experience.',
      iconSrc: '/icons/firefox-6.svg',
    },
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
  ];

  return (
    <AnimatedSection>
      <section className="bg-[#D2F2E2] py-[50px] px-5 md:p-[50px] mt-[120px] md:mt-[140px]">
        <div className="container-custom">
          <div className="flex flex-col items-center">
            <FadeInUp>
              <h2 className="text-[42px] md:text-[56px] font-semibold text-center mb-[30px] leading-tight">
                Available for your{' '}
                <span className="text-primary">workflow</span>
              </h2>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <p className="text-center mb-[30px] max-w-[640px] text-lg md:text-xl leading-relaxed text-secondary/90">
                TableXport integrates seamlessly into your existing tools and workflows across all platforms.
              </p>
            </FadeInUp>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px] w-full max-w-6xl">
              {extensions.map((extension) => (
                <ExtensionCard
                  key={extension.iconSrc}
                  name={extension.name}
                  subtitle={extension.subtitle}
                  description={extension.description}
                  iconSrc={extension.iconSrc}
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