'use client'

// Imports
import React, { useState } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

interface TabItem {
  value: string;
  label: string;
  placeholderColor: string;
}

const tabItems: TabItem[] = [
  {
    value: 'chatgpt',
    label: 'Chat GPT',
    placeholderColor: 'bg-red-500'
  },
  {
    value: 'claude',
    label: 'Claude',
    placeholderColor: 'bg-green-500'
  },
  {
    value: 'gemini',
    label: 'Gemini',
    placeholderColor: 'bg-orange-500'
  }
];

const Demo = () => {
  const [activeTab, setActiveTab] = useState('chatgpt')

  return (
    <section className='py-[50px] md:py-[100px]'>
      <div className='container-custom'>
        <h2 className='text-[40px] md:text-[55px] font-semibold text-center mb-[30px]'>
          See TabXport <span className='text-primary'>in Action</span>
        </h2>

        <p className='text-center mb-[50px]'>No coding needed. Works directly in your AI chat.</p>

        <div className='flex justify-between items-start gap-[1.875rem] relative'>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className='w-[36.5rem]'
          >
            <TabsList className='flex flex-col w-full space-y-[1.875rem] bg-transparent p-0'>
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className='w-full h-[4.375rem] px-6 justify-start text-left text-secondary bg-white border border-[rgba(6,32,19,0.2)] rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary hover:bg-secondary/5'
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Tabs 
            value={activeTab} 
            className='w-[33.125rem]'
          >
            {tabItems.map((tab) => (
              <TabsContent 
                key={tab.value} 
                value={tab.value}
                className='mt-0'
              >
                <div className={`w-full h-[20rem] rounded-[10px] ${tab.placeholderColor}`} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  )
}

export default Demo