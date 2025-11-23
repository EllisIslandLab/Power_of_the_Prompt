'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * AI Builder Landing Page Component
 *
 * Presents users with choice between:
 * - Free Template Builder: Quick component-based builder
 * - AI Premium Builder: $5 AI-guided step-by-step creation (30 credits)
 *
 * Features:
 * - Clear comparison of free vs premium
 * - Rollover pricing explanation
 * - Automatic payment flow for AI Premium
 * - Seamless transition to builder experience
 */
export function AIBuilderLanding() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPath, setSelectedPath] = useState<'free' | 'ai' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleStartBuilding(path: 'free' | 'ai') {
    setSelectedPath(path)
    setIsCreating(true)
    setError(null)

    try {
      if (path === 'ai') {
        const email = prompt('Enter your email to get started with AI Premium:')
        if (!email) {
          setIsCreating(false)
          setSelectedPath(null)
          return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          setError('Please enter a valid email address')
          setIsCreating(false)
          setSelectedPath(null)
          return
        }

        // Create checkout session for AI Premium
        const response = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productSlug: 'ai_premium',
            returnContext: {
              type: 'demo_builder',
              userEmail: email
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create checkout session')
        }

        const { url } = await response.json()

        if (!url) {
          throw new Error('No checkout URL received')
        }

        // Redirect to Stripe checkout
        window.location.href = url
      } else {
        // Create free demo project
        const response = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            builderType: 'free',
            aiPremium: false
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create demo session')
        }

        const { sessionId } = await response.json()
        router.push(`/get-started/build/${sessionId}`)
      }
    } catch (err) {
      console.error('Error starting builder:', err)
      setError(err instanceof Error ? err.message : 'Failed to start builder')
      setIsCreating(false)
      setSelectedPath(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 relative z-10">
            Build Your Professional Website
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto relative z-10">
            Choose your path: Free template builder or AI-powered precision
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg relative z-10">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Builder */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 relative z-10">
            <div className="text-center">
              <div className="text-4xl mb-4">🆓</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Free Template Builder</h2>
              <p className="text-gray-600 mb-6">
                Quick & simple, great for testing
              </p>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Pre-built component library</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Basic customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Instant preview</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">No credit card required</span>
                </li>
              </ul>

              <button
                onClick={() => handleStartBuilding('free')}
                disabled={isCreating && selectedPath === 'free'}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating && selectedPath === 'free' ? 'Starting...' : 'Start Free Build'}
              </button>
            </div>
          </div>

          {/* AI Premium */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border-2 border-blue-400 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold z-10">
              Recommended
            </div>

            <div className="text-center relative z-10">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">AI Premium Builder</h2>
              <p className="text-3xl font-bold text-blue-600 mb-2">$5</p>
              <p className="text-gray-700 mb-6">
                AI-guided, step-by-step creation
              </p>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700"><strong>30 AI-powered refinements</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">Conversational guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">Visual help when needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">Better quality code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">Personalized recommendations</span>
                </li>
              </ul>

              <div className="bg-white/80 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  💎 <strong>This $5 rolls into any package!</strong>
                  <br />
                  <span className="text-gray-600">Never pay extra when you upgrade.</span>
                </p>
              </div>

              <button
                onClick={() => handleStartBuilding('ai')}
                disabled={isCreating && selectedPath === 'ai'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCreating && selectedPath === 'ai' ? 'Starting...' : 'Start AI Build - $5'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200 relative z-10">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
              How Rollover Pricing Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h4 className="font-semibold mb-2 text-gray-900">Step 1</h4>
                <p className="text-sm text-gray-600">
                  Start with AI Premium for $5
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-semibold mb-2 text-gray-900">Step 2</h4>
                <p className="text-sm text-gray-600">
                  Upgrade to Textbook for only $14 more (not $19)
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏗️</div>
                <h4 className="font-semibold mb-2 text-gray-900">Step 3</h4>
                <p className="text-sm text-gray-600">
                  Get Architecture Toolkit for $171 (not $190)
                </p>
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-gray-600">
              Every dollar you spend credits toward the next tier. No wasted money!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
