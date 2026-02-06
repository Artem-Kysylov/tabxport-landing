'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { AnimatedSection, FadeInUp } from '@/components/animations'

const LabsTeaserSection = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // TODO: Add backend logic for waitlist
      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), 3000)
    }
  }

  return (
    <AnimatedSection>
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text & Form */}
            <div className="space-y-8">
              <FadeInUp>
                <div className="flex items-center px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
                  Coming Soon from Syntax Labs
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <h2 className="text-[3.4375rem] font-semibold leading-tight">
                  Stop struggling with <span className="text-primary">AI prompts.</span>
                </h2>
              </FadeInUp>

              <FadeInUp delay={0.3}>
                <p className="text-[1.125rem] text-secondary/80 leading-relaxed">
                  Turn 2-word ideas into production-ready instructions for Cursor, Claude, and Windsurf. Get perfect code on the first try.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[1.125rem]">Optimized for Vibe Coding</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[1.125rem]">Context-rich prompt generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[1.125rem]">Zero-friction interface</span>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.5}>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-[8px] border border-primary-light bg-white text-[1.125rem] placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <Button 
                    type="submit" 
                    className="whitespace-nowrap px-6"
                    disabled={isSubmitted}
                  >
                    {isSubmitted ? 'Added!' : 'Join Waitlist'}
                  </Button>
                </form>
              </FadeInUp>
            </div>

            {/* Right Column - Image */}
            <FadeInUp delay={0.6}>
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src="/images/prompt-builder-preview.png"
                    alt="Prompt Builder Preview"
                    width={600}
                    height={375}
                    className="w-full h-auto object-cover"
                    priority={false}
                  />
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default LabsTeaserSection
