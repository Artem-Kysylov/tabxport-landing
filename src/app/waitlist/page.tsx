'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

import { submitToWaitlist } from '@/app/actions/submit-waitlist'

export default function WaitlistPage() {
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
      formData.append('source', 'waitlist-page')

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
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-16 items-center">
            {/* Left Column - Text & Form */}
            <div className="min-w-0 space-y-8 lg:pr-6 lg:max-w-[560px]">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight">
                  Stop struggling with{' '}
                  <span className="text-white">AI prompts.</span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed max-w-2xl">
                  Turn 2-word ideas into production-ready instructions for Cursor, Claude, and Windsurf. Get perfect code on the first try.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 border border-gray-800 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-white/90">Optimized for Vibe Coding</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 border border-gray-800 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-white/90">Context-rich prompt generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 border border-gray-800 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg text-white/90">Zero-friction interface</span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg">
                  <div className="flex-1">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('')
                      }}
                      placeholder="Enter your email"
                      className={`w-full px-6 py-4 rounded-full bg-transparent border text-white text-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition-all ${
                        error
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-800 focus:border-gray-600'
                      }`}
                      required
                    />
                    {error && (
                      <p className="text-red-400 text-sm mt-2 ml-6">{error}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Joining...
                      </span>
                    ) : (
                      'Join Waitlist'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Video */}
            <div className="min-w-0 relative lg:pl-4 lg:justify-self-end">
              <div className="relative w-full rounded-lg overflow-hidden lg:max-w-[760px] xl:max-w-[820px]">
                <video
                  src="/prompt-builder-video/prompt-builder.mp4"
                  width={820}
                  height={512}
                  className="w-full h-auto object-cover rounded-lg"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
