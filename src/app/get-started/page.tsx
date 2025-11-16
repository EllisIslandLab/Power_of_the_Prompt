'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BuilderLanding } from '@/components/builder/BuilderLanding'
import { AnimatedBackground } from '@/components/effects/AnimatedBackground'

export default function GetStartedPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  async function handleBuilderChoice(type: 'free' | 'ai_premium') {
    setIsCreating(true)

    try {
      // Create new demo session
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ builderType: type })
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const { sessionId } = await response.json()

      // Redirect to builder
      router.push(`/get-started/build/${sessionId}`)
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Please try again.')
      setIsCreating(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Build Your Professional Website
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your path: Free template builder or AI-powered precision
          </p>
        </div>

        <BuilderLanding
          onChoose={handleBuilderChoice}
          isLoading={isCreating}
        />

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>No credit card required to start. Build your site first, purchase when ready.</p>
        </div>
      </div>
    </div>
  )
}
