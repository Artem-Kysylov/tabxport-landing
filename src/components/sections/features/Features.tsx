// Imports 
import React from 'react'

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => {
  return (
    <div className="bg-white rounded-[10px] p-[15px] flex flex-col items-center gap-[15px]">
      <div className="w-[44px] h-[44px] rounded-full bg-primary-light" />
      <h3 className="text-[25px] font-semibold">{title}</h3>
      <p>{description}</p>
    </div>
  )
}

const Features = () => {
  return (
    <section className="bg-primary-light pt-[150px] pb-[50px]">
      <div className="container-custom">
        <div className="flex flex-col items-center">
          <h2 className="text-[55px] mb-[30px] font-semibold text-center">
            Why <span className="text-primary">TabXport?</span>
          </h2>
          <p className="text-center mb-[30px] max-w-[535px]">
            After watching my colleagues in analytics struggle for hours
            with manual data transfers from AI chats, I created TabXport -
            the one-click solution they desperately needed.
          </p>
          <div className="grid grid-cols-3 gap-[30px] w-full">
            <FeatureCard
              title="One-click"
              description="No manual copy-pasting"
            />
            <FeatureCard
              title="Fixes messy tables"
              description="Repairs broken layouts"
            />
            <FeatureCard
              title="Save Anywhere"
              description="Local files or Google Drive"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features