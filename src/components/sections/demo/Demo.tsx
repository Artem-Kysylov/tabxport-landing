'use client'

// Imports
import React, { useState } from 'react'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { motion, AnimatePresence } from 'framer-motion'

interface TabItem {
  value: string;
  label: string;
  videoSrc: string;
}

const tabItems: TabItem[] = [
  {
    value: 'regularexport',
    label: 'Regular Export (Excel)',
    videoSrc: '/demo-videos/export excel.mp4',
  },
  {
    value: 'batchexport',
    label: 'Batch Export (ZIP / Combined)',
    videoSrc: '/demo-videos/batch export.mp4',
  },
  {
    value: 'remembermyformat',
    label: 'Remember My Format',
    videoSrc: '/demo-videos/remember my format.mp4',
  },
  {
    value: 'datasummary',
    label: 'Data Summary & Analysis',
    videoSrc: '/demo-videos/analytics .mp4',
  },
  {
    value: 'googlesheets',
    label: 'Google Sheets on Drive',
    videoSrc: '/demo-videos/google sheets export.mp4',
  },
];

const Demo = () => {
  const [activeTab, setActiveTab] = useState('regularexport')

  return (
    <AnimatedSection>
      <section id="demo" className='py-[50px] md:py-[100px]'>
        <div className='container-custom'>
          <FadeInUp>
            <h2 className='text-[40px] md:text-[55px] font-semibold text-center mb-[30px]'>
              See TableXport <span className='text-primary'>in Action</span>
            </h2>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className='text-center mb-[50px]'>From single-table exports to batch operations and Google Drive sync — watch it work in seconds.</p>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <div className='flex flex-col md:flex-row justify-between items-start gap-[1.875rem]'>
              {/* Tabs Navigation */}
              <div className='w-full md:w-[36.5rem] flex flex-col gap-[1.25rem]'>
                {tabItems.map((tab, index) => (
                  <motion.button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full h-[4.375rem] px-6 text-left rounded-[10px] border transition-colors flex items-center justify-center cursor-pointer text-[18px] font-semibold gap-[15px]
                      ${activeTab === tab.value 
                        ? 'bg-primary text-white border-primary [&_img]:brightness-0 [&_img]:invert' 
                        : 'bg-white text-secondary border-[rgba(6,32,19,0.2)] hover:bg-secondary/5'
                      }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Tabs Content */}
              <div className='w-full md:w-[33.125rem] mt-[30px] md:mt-0'>
                <AnimatePresence mode="wait">
                  {tabItems.map((tab) => (
                    activeTab === tab.value && (
                      <motion.div
                        key={tab.value}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-[20rem] rounded-[10px] overflow-hidden bg-gray-100"
                      >
                        <video
                          key={tab.value} // Принудительная перезагрузка при смене таба
                          className="w-full h-full object-cover rounded-[10px]"
                          autoPlay
                          muted
                          loop
                          playsInline
                        >
                          <source src={tab.videoSrc} type="video/mp4" />
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-500">Video not supported</p>
                          </div>
                        </video>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default Demo