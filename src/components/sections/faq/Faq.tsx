// Imports 
import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FiPlus } from 'react-icons/fi'

const Faq = () => {
  return (
    <section>
      <div className='container-custom'>
        <h2 className='text-[3.4375rem] font-semibold text-center mb-[3.125rem]'>
          Frequently <span className='text-primary'>Asked Questions</span>
        </h2>

        <Accordion type="single" collapsible className='space-y-[1.875rem]'>
          <AccordionItem value="item-1" className='border-none'>
            <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
              Which AI platforms are supported?
              <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
            </AccordionTrigger>
            <AccordionContent className='text-[1.125rem] pt-4'>
              Works with ChatGPT, Claude, Gemini, and Perplexity
            </AccordionContent>
          </AccordionItem>

          <div className='h-[1px] bg-secondary/10'></div>

          <AccordionItem value="item-2" className='border-none'>
            <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
              How to export to Google Sheets?
              <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
            </AccordionTrigger>
            <AccordionContent className='text-[1.125rem] pt-4'>
              Pro feature: Click the Google Drive icon when saving.
            </AccordionContent>
          </AccordionItem>

          <div className='h-[1px] bg-secondary/10'></div>

          <AccordionItem value="item-3" className='border-none'>
            <AccordionTrigger className='text-[1.5625rem] font-semibold hover:no-underline data-[state=open]:text-primary group [&>svg:last-child]:hidden cursor-pointer'>
              What if my table isn't detected?
              <FiPlus className='w-[34px] h-[34px] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45 text-primary' />
            </AccordionTrigger>
            <AccordionContent className='text-[1.125rem] pt-4'>
              Use Manual Select → highlight the table → TabXport will fix the rest.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}

export default Faq