// Imports 
import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FiPlus } from 'react-icons/fi'
import { AnimatedSection, FadeInUp } from '@/components/animations'

const Faq = () => {
  return (
    <AnimatedSection>
      <section id="faq">
        <div className='container-custom'>
          <FadeInUp>
            <h2 className='text-[3.4375rem] font-semibold text-center mb-[3.125rem]'>
              Frequently <span className='text-primary'>Asked Questions</span>
            </h2>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <Accordion type="single" collapsible className='space-y-[1.875rem]'>
              <AccordionItem value="item-1" className='border-none'>
                <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
                  Which AI platforms are supported?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  Works with ChatGPT, Claude, Gemini, and Deepseek.
                </AccordionContent>
              </AccordionItem>

              <div className='h-[1px] bg-secondary/10'></div>

              {/* <AccordionItem value="item-2" className='border-none'>
                <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
                  How do I export to Google Sheets?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  Available in Pro. Click the Drive icon when saving.
                </AccordionContent>
              </AccordionItem> */}

              <div className='h-[1px] bg-secondary/10'></div>

              <AccordionItem value="item-4" className='border-none'>
                <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
                  Can I export multiple tables at once?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  {/* Yes! Pro users can batch export as ZIP or combined Excel. */}
                  Yes, batch export is available to ZIP or a single Excel file
                </AccordionContent>
              </AccordionItem>

              <div className='h-[1px] bg-secondary/10'></div>

              <AccordionItem value="item-5" className='border-none'>
                <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
                  What if my table isn't detected?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  Use Manual Select, highlight the table — TableXport will fix the rest.
                </AccordionContent>
              </AccordionItem>

              <div className='h-[1px] bg-secondary/10'></div>

              {/* <AccordionItem value="item-6" className='border-none'>
                <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
                  Need more details?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  Check our full documentation → <a href="https://tablexport.gitbook.io/tablexport-docs/wkbciB0ogW3EFOM5Gwhg/" target='_blank' className='text-primary'>Documentation</a>
                </AccordionContent>
              </AccordionItem> */}
              <AccordionItem value="item-6" className='border-none'>
                <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
                  Need more details?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  <a
                    href="mailto:hello@tablexport.com"
                    title="Any questions? Contact to me directly"
                    className='text-primary'
                  >
                    Any questions? Contact to me directly
                  </a>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FadeInUp>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default Faq