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
    <div className="bg-white rounded-[10px] p-[30px] md:p-[15px] flex flex-col items-center justify-center gap-[15px] md:h-[204px] hover:scale-105 transition-transform duration-300">
      <div className="w-[44px] h-[44px] rounded-full bg-[#D2F2E2] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-[25px] font-semibold text-center">{title}</h3>
      <p className="text-center">{description}</p>
    </div>
  )
}

const Features = () => {
  const featureCards = [
    {
      icon: <HiRocketLaunch size={24} className="text-primary" />,
      title: "One-click Export",
      description: "Any AI table, any format — Excel, CSV, PDF, DOCX."
    },
    {
      icon: <HiSparkles size={24} className="text-primary" />,
      title: "Batch & Smart Fix",
      description: "Export multiple tables at once, auto-fix broken layouts."
    },
    {
      icon: <HiDocumentCheck size={24} className="text-primary" />,
      title: "Save Anywhere",
      description: "Local files or Google Drive. 'Remember my format for instant saves."
    }
  ];

  return (
    <AnimatedSection>
      <section id="features" className="bg-[#D2F2E2] py-[50px] px-5 md:p-[50px] mt-[200px]">
        <div className="container-custom">
          <div className="flex flex-col items-center">
            <FadeInUp>
              <h2 className="text-[40px] md:text-[55px] font-semibold text-center mb-[30px]">
                Why <span className="text-primary">TabXport?</span>
              </h2>
            </FadeInUp>
            
            <FadeInUp delay={0.2}>
              <p className="text-center mb-[30px] max-w-[535px]">
                I built TableXport after watching analysts waste hours copy-pasting from AI chats.
                Now, it's the one-click tool that handles everything for you.
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