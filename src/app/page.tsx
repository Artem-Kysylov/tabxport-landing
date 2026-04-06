// Import components  
import Hero from "@/components/sections/hero/Hero";
import Features from "@/components/sections/features/Features";
import Faq from "@/components/sections/faq/Faq";
import Cta from "@/components/sections/cta/Cta";
import Demo from "@/components/sections/demo/Demo";
// import PricePlans from "@/components/sections/price-plans/PricePlans";
import FreePlan from "@/components/sections/free-plan/FreePlan";
import About from "@/components/sections/about/About";
import LabsTeaserSection from "@/components/sections/labs-teaser/LabsTeaserSection";

import Image from 'next/image'

export default function Home() {
  return (
    <main className='relative min-h-screen standalone-app-shell'>
      <div className='absolute -top-20 left-0 w-full h-[800px] -z-10 standalone-hidden'>
        <Image 
          src="/bg.png"
          alt="background"
          fill
          priority
          className='object-cover object-top'
          sizes="100vw"
          quality={90}
        />
      </div>
      <Hero />
      <div className='standalone-hidden'>
        <Features />
      </div>
      <div className='standalone-hidden'>
        <Demo />
      </div>
      <div className='standalone-hidden'>
        <FreePlan />
      </div>
      {/* <PricePlans /> */}
      <div className='standalone-hidden'>
        <LabsTeaserSection />
      </div>
      <div className='standalone-hidden'>
        <Faq />
      </div>
      <div className='standalone-hidden'>
        <About />
      </div>
      <div className='standalone-hidden'>
        <Cta />
      </div>
    </main>
  );
}
