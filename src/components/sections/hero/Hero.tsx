import React from 'react'
import { Button } from '@/components/ui/button'

const Hero = () => {
  return (
    <section>
      <div className='container-custom'>
        <div className='flex flex-col items-center justify-center gap-8 pt-[200px]'>
          <h1 className='text-center text-7xl font-semibold'>
            <span className='text-primary'>Click. Export. Done.</span> AI Tables → Excel, PDF, Google Sheets
          </h1>
          <p className='text-center font-normal'>Stop wasting hours fixing AI-generated tables.<br /> TableXport converts them in seconds — perfectly formatted, ready to use.</p>
          <Button>Add to Chrome - It`s free</Button>
        </div>
      </div>
    </section>
  )
}

export default Hero