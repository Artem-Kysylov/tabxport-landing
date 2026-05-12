// Imports 
import React from 'react'
import { HiRocketLaunch } from "react-icons/hi2"
import { HiSparkles } from "react-icons/hi2"
import { HiDocumentCheck } from "react-icons/hi2"
import { AnimatedSection, StaggerContainer, FadeInUp } from '@/components/animations'

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white rounded-[10px] py-[30px] px-[30px] md:py-[30px] md:px-[25px] flex flex-col items-center justify-center gap-[20px] md:h-[300px] hover:scale-105 transition-transform duration-300">
      <div className="w-[52px] h-[52px] aspect-square rounded-full bg-[#D2F2E2] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-[22px] md:text-[25px] font-semibold text-center whitespace-pre-line leading-snug max-w-[280px] mx-auto">
        {title}
      </h3>
      <p className="text-center leading-relaxed">{description}</p>
    </div>
  )
}

const Features = () => {
  const featureCards = [
    {
      icon: <HiRocketLaunch size={28} className="text-primary" />,
      title: "Preview Before You\nExport",
      description: "Catch formatting issues, fix mistakes, and see exactly how your spreadsheet or PDF will look before downloading."
    },
    {
      icon: <HiSparkles size={28} className="text-primary" />,
      title: "Send It Straight to\nGoogle Sheets",
      description: "Skip downloads completely. Export clean tables directly into your Google Drive in one click."
    },
    {
      icon: <HiDocumentCheck size={28} className="text-primary" />,
      title: "Client-Ready PDF\nReports",
      description: "Turn raw data into branded PDF reports with your logo, colors, and polished layouts."
    }
  ];

  return (
    <AnimatedSection>
      <section id="features" className="bg-[#D2F2E2] py-[50px] px-5 md:p-[50px] mt-[120px] md:mt-[140px]">
        <div className="container-custom">
          <div className="flex flex-col items-center">
            <FadeInUp>
              <h2 className="text-[40px] md:text-[55px] font-semibold text-center mb-[30px]">
                Why <span className="text-primary">TableXport?</span>
              </h2>
            </FadeInUp>
            
            <FadeInUp delay={0.2}>
              <p className="text-center mb-[30px] max-w-[640px]">
                TableXport turns messy AI output into polished spreadsheets, branded PDFs, and shareable cloud docs without the cleanup work.
              </p>
            </FadeInUp>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-[30px] w-full" staggerDelay={0.2}>
              {featureCards.map((card, index) => (
                <FeatureCard
                  key={index}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default Features