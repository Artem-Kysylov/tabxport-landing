'use client';

import React from 'react';
import { AnimatedSection, StaggerContainer, FadeInUp } from '@/components/animations';
import { CheckCircle, Clock } from 'lucide-react';

interface RoadmapItemProps {
  title: string;
  description: string;
  isCompleted?: boolean;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({
  title,
  description,
  isCompleted = false,
}) => {
  return (
    <FadeInUp className="h-full">
      <div className="flex h-full flex-col bg-white rounded-[10px] py-[30px] px-[30px] md:px-[25px] hover:scale-105 transition-transform duration-300">
        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          {isCompleted ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <CheckCircle size={14} />
              Active
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-sm font-medium">
              <Clock size={14} />
              Coming Soon
            </div>
          )}
        </div>

        <h3 className="text-xl md:text-[22px] font-bold text-slate-900 mb-3">{title}</h3>

        {/* Description */}
        <p className="text-base md:text-[1.0625rem] text-slate-600 leading-relaxed">{description}</p>
      </div>
    </FadeInUp>
  );
};

const Roadmap = () => {
  const roadmapItems = [
    {
      title: 'Multistore Launch',
      description: 'We are live! Available on Chrome, Firefox, Edge, and Raycast.',
      isCompleted: true,
    },
    {
      title: 'Professional PDF Templates',
      description: 'Look professional in seconds. Generate branded, clean PDF reports that are ready to show your clients.',
      isCompleted: false,
    },
    {
      title: 'AI Vision Integration',
      description: 'Unstoppable data capture. Export tables directly from screenshots and images using advanced AI vision.',
      isCompleted: false,
    },
    {
      title: 'Smart Data Cleaning',
      description: 'No more manual cleanup. Auto-format dates, currencies, and units before export. We do the dirty work for you.',
      isCompleted: false,
    },
    {
      title: 'Public Developer API',
      description: 'Build on top of TableXport. Integrate our table-parsing engine into your own automated workflows and apps.',
      isCompleted: false,
    },
    {
      title: 'Mobile Companion (Android)',
      description: 'Data in your pocket. Capture tables on the go and manage your exports directly from your phone.',
      isCompleted: false,
    },
  ];

  return (
    <AnimatedSection>
      <section className="bg-[#D2F2E2] py-[50px] px-5 md:p-[50px] mt-[120px] md:mt-[140px]">
        <div className="container-custom">
          <div className="flex flex-col items-center">
            <FadeInUp>
              <h2 className="text-[42px] md:text-[56px] font-semibold text-center mb-[30px] leading-tight">
                What&apos;s Next?{' '}
                <span className="text-primary">The Roadmap</span>
              </h2>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <p className="text-center mb-[30px] max-w-[640px] text-lg md:text-xl leading-relaxed text-secondary/90">
                We&apos;re continuously evolving TableXport to meet your data export needs. Here&apos;s what we&apos;re building next.
              </p>
            </FadeInUp>

            {/* Roadmap Timeline - Horizontal on desktop, vertical on mobile */}
            <div className="w-full max-w-7xl">
              {/* Desktop: Horizontal Timeline */}
              <div className="hidden lg:block">
                <StaggerContainer
                  className="grid grid-cols-3 gap-[30px] mb-8 items-stretch"
                  itemClassName="h-full min-h-0"
                >
                  {roadmapItems.slice(0, 3).map((item, index) => (
                    <RoadmapItem
                      key={index}
                      title={item.title}
                      description={item.description}
                      isCompleted={item.isCompleted}
                    />
                  ))}
                </StaggerContainer>
                <StaggerContainer className="grid grid-cols-3 gap-[30px] items-stretch" itemClassName="h-full min-h-0">
                  {roadmapItems.slice(3, 6).map((item, index) => (
                    <RoadmapItem
                      key={index + 3}
                      title={item.title}
                      description={item.description}
                      isCompleted={item.isCompleted}
                    />
                  ))}
                </StaggerContainer>
              </div>

              {/* Mobile & Tablet: Vertical Timeline */}
              <div className="lg:hidden">
                <StaggerContainer
                  className="grid grid-cols-1 md:grid-cols-2 gap-[30px] items-stretch"
                  itemClassName="h-full min-h-0"
                >
                  {roadmapItems.map((item, index) => (
                    <RoadmapItem
                      key={index}
                      title={item.title}
                      description={item.description}
                      isCompleted={item.isCompleted}
                    />
                  ))}
                </StaggerContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
};

export default Roadmap;