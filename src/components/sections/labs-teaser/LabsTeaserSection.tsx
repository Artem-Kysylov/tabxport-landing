'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { AnimatedSection, FadeInUp } from '@/components/animations'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

import { submitToWaitlist } from '@/app/actions/submit-waitlist'

const LabsTeaserSection = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError('Please enter your email.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email.')
      return
    }
    setError('')

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', trimmedEmail)

      const result = await submitToWaitlist(formData)

      if ('error' in result) {
        setError(result.error)
        return
      }

      setEmail('')
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#39FF14', '#000000', '#FFFFFF'],
      })

      toast.success("You're on the list. We'll ping you soon.", {
        className: 'text-[20px] font-bold',
        descriptionClassName: 'text-[20px] font-bold text-center',
      })
    } finally {
      setIsLoading(false)
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
                <div className="flex items-center py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
                  Coming Soon from Syntax Labs
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <h2 className="text-[3.4375rem] md:text-[3.4375rem] font-semibold leading-tight md:leading-tight">
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
                  <div className="flex-1 flex flex-col gap-1">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('')
                      }}
                      placeholder="Enter your email"
                      className={`flex-1 px-4 py-3 rounded-[8px] border bg-white text-[1.125rem] placeholder:text-secondary/60 focus:outline-none focus:ring-2 transition-colors ${
                        error
                          ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
                          : 'border-primary-light focus:ring-primary focus:border-transparent'
                      }`}
                      required
                    />
                    {error && (
                      <p className="text-sm text-red-500 font-medium">{error}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="whitespace-nowrap px-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining...
                      </span>
                    ) : (
                      'Join Waitlist'
                    )}
                  </Button>
                </form>
              </FadeInUp>
            </div>

            {/* Right Column - Video */}
            <FadeInUp delay={0.6}>
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <video
                    src="/prompt-builder-video/prompt-builder.mp4"
                    width={600}
                    height={375}
                    className="w-full h-auto object-cover rounded-lg"
                    autoPlay
                    loop
                    muted
                    playsInline
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
