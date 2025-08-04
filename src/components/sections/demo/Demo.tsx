'use client'

// Imports
import React, { useState } from 'react'

interface TabItem {
  value: string;
  label: string;
  placeholderColor: string;
}

const tabItems: TabItem[] = [
  {
    value: 'regularexport',
    label: 'Regular Export (Excel)',
    placeholderColor: 'bg-red-500',
  },
  {
    value: 'batchexport',
    label: 'Batch Export (ZIP / Combined)',
    placeholderColor: 'bg-green-500',
  },
  {
    value: 'remembermyformat',
    label: 'Remember My Format',
    placeholderColor: 'bg-orange-500',
  },
  {
    value: 'datasummary',
    label: 'Data Summary & Analysis',
    placeholderColor: 'bg-red-500',
  },
  {
    value: 'googlesheets',
    label: 'Google Sheets on Drive',
    placeholderColor: 'bg-orange-500',
  },
];

const Demo = () => {
  const [activeTab, setActiveTab] = useState('regularexport')

  return (
    <section id="demo" className='py-[50px] md:py-[100px]'>
      <div className='container-custom'>
        <h2 className='text-[40px] md:text-[55px] font-semibold text-center mb-[30px]'>
          See TabXport <span className='text-primary'>in Action</span>
        </h2>

        <p className='text-center mb-[50px]'>From single-table exports to batch operations and Google Drive sync — watch it work in seconds.</p>

        <div className='flex flex-col md:flex-row justify-between items-start gap-[1.875rem]'>
          {/* Tabs Navigation */}
          <div className='w-full md:w-[36.5rem] flex flex-col gap-[1.25rem]'>
            {tabItems.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`w-full h-[4.375rem] px-6 text-left rounded-[10px] border transition-colors flex items-center justify-center cursor-pointer text-[25px] font-bold gap-[15px]
                  ${activeTab === tab.value 
                    ? 'bg-primary text-white border-primary [&_img]:brightness-0 [&_img]:invert' 
                    : 'bg-white text-secondary border-[rgba(6,32,19,0.2)] hover:bg-secondary/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className='w-full md:w-[33.125rem] mt-[30px] md:mt-0'>
            {tabItems.map((tab) => (
              <div
                key={tab.value}
                className={`${activeTab === tab.value ? 'block' : 'hidden'}`}
              >
                <div className={`w-full h-[20rem] rounded-[10px] ${tab.placeholderColor}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Demo