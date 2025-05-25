// Imports 
import React from 'react'
import { HiRocketLaunch } from "react-icons/hi2"
import { HiSparkles } from "react-icons/hi2"
import { HiDocumentCheck } from "react-icons/hi2"

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white rounded-[10px] p-[15px] flex flex-col items-center justify-center gap-[15px] h-[204px]">
      <div className="w-[44px] h-[44px] rounded-full bg-[#D2F2E2] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-[25px] font-semibold">{title}</h3>
      <p>{description}</p>
    </div>
  )
}

const Features = () => {
  return (
    <section className="bg-[#D2F2E2] p-[50px] mt-[100px]">
      <div className="container-custom">
        <div className="flex flex-col items-center">
          <h2 className="text-[55px] font-semibold text-center mb-[30px]">
            Why <span className="text-primary">TabXport?</span>
          </h2>
          <p className="text-center mb-[30px] max-w-[535px]">
            After watching my colleagues in analytics struggle for hours
            with manual data transfers from AI chats, I created TabXport -
            the one-click solution they desperately needed.
          </p>
          <div className="grid grid-cols-3 gap-[30px] w-full">
            <FeatureCard
              icon={<HiRocketLaunch size={24} className="text-primary" />}
              title="One-click"
              description="No manual copy-pasting"
            />
            <FeatureCard
              icon={<HiSparkles size={24} className="text-primary" />}
              title="Fixes messy tables"
              description="Repairs broken layouts"
            />
            <FeatureCard
              icon={<HiDocumentCheck size={24} className="text-primary" />}
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