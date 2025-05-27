// Import components  
import Hero from "@/components/sections/hero/Hero";
import Features from "@/components/sections/features/Features";
import Faq from "@/components/sections/faq/Faq";
import Cta from "@/components/sections/cta/Cta";
import Demo from "@/components/sections/demo/Demo";
import PricePlans from "@/components/sections/price-plans/PricePlans";

import Image from 'next/image'

export default function Home() {
  return (
    <main className='relative min-h-screen'>
      <div className='absolute -top-20 left-0 w-full h-[800px] -z-10'>
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
      <Features />
      <Demo />
      <PricePlans />
      <Faq />
      <Cta />
    </main>
  );
}
