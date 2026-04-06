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

function Faq() {
  return (
    <AnimatedSection>
      <section id="faq">
        <div className='container-custom'>
          <FadeInUp>
            <h2 className='text-[2.5rem] md:text-[3.4375rem] font-semibold text-center mb-[3.125rem] leading-tight md:leading-tight'>
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
                  TableXport seamlessly works with all major AI chatbots, including ChatGPT, Claude, Gemini, and DeepSeek. You can paste tables in Markdown, HTML, CSV, or TSV formats directly into our smart converter.
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
                  Yes! With our Batch Export feature, you can paste multiple AI-generated tables and download them as a single combined Excel file (.xlsx) or a ZIP archive in seconds.
                </AccordionContent>
              </AccordionItem>

              <div className='h-[1px] bg-secondary/10'></div>

              <AccordionItem value="item-5" className='border-none'>
                <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
                  What if my table is not formatted correctly?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  Our smart parser auto-detects and fixes broken AI layouts. Plus, with our Live Edit & Preview feature, you can manually adjust cell values, fix typos, and preview the data before exporting.
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
                  How does the Google Drive export work?
                  <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
                </AccordionTrigger>
                <AccordionContent className='text-[1.125rem] pt-4'>
                  You securely authenticate via Google. We only request permission to create and save the specific table you choose. We never read your existing files or store your data on our servers.
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