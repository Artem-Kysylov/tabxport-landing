// Import components  
import Hero from "@/components/sections/hero/Hero";
import Features from "@/components/sections/features/Features";
import Faq from "@/components/sections/faq/Faq";
import Cta from "@/components/sections/cta/Cta";
import Demo from "@/components/sections/demo/Demo";
import Storytelling from "@/components/sections/storytelling/Storytelling";

export default function Home() {
  return (
    <div>
      <Hero />  
      <Features />
      <Storytelling />
      <Demo />
      <Faq />
      <Cta />
    </div>
  );
}
