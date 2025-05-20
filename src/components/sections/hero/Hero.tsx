import React from 'react'
import { Button } from '@/components/ui/button'

const Hero = () => {
  return (
    <section>
      <div className='container-custom'>
        <div className='flex flex-col items-center justify-center gap-8'>
          <h1 className='text-center text-7xl font-semibold'>
            <span className='text-primary'>Click Export:</span> ChatGPT Tables → Excel, Sheets, CSV
          </h1>
          <p className='text-center font-normal'>Stop wasting time on manual copying. TabXport converts AI-generated tables in seconds — no formatting hell</p>
          <Button>Add to Chrome - It`s free</Button>
        </div>
      </div>
    </section>
  )
}

export default Hero