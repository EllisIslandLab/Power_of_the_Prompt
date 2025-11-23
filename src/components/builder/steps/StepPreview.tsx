'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, ArrowLeft, DollarSign, Clock, BookOpen, Video, Package } from 'lucide-react'

interface StepPreviewProps {
  sessionId: string
  data: any
  onChange: (data: any) => void
}

export function StepPreview({ sessionId, data, onChange }: StepPreviewProps) {
  const router = useRouter()
  const [showObjectionOptions, setShowObjectionOptions] = useState(false)
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleMainPurchase() {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          tier: 'complete_package', // $190 tier
          productSlug: 'complete-package'
        })
      })

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      setIsProcessing(false)
    }
  }

  async function handleObjectionPurchase(tier: string) {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          tier,
          objectionResponse: selectedObjection
        })
      })

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      setIsProcessing(false)
    }
  }

  function handleObjectionSelect(objection: string) {
    setSelectedObjection(objection)
    onChange({ objectionResponse: objection })
  }

  function handleBackToSelections() {
    setShowObjectionOptions(false)
    setSelectedObjection(null)
  }

  return (
    <div className="space-y-6">
      {/* Preview Window */}
      <div className="bg-muted rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">Preview</span>
        </div>

        <div className="bg-card rounded-lg overflow-hidden shadow-inner">
          {data.previewHtml ? (
            <iframe
              srcDoc={data.previewHtml}
              className="w-full h-[400px] border-0"
              title="Website Preview"
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Preview loading...
            </div>
          )}
        </div>
      </div>

      {/* Main Offer or Objection Handling */}
      {!showObjectionOptions ? (
        /* Main $190 Package Offer */
        <div className="space-y-6">
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Complete Website Package
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-primary">$190</span>
                <span className="text-muted-foreground">one-time</span>
              </div>
              <p className="text-sm text-accent mt-1">
                Your $5 entry fee is already applied!
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Full source code ownership',
                '30 AI-powered customizations',
                'Step-by-step implementation guide',
                'Video course recordings',
                'Priority email support',
                'Lifetime updates'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                  <Zap className="h-5 w-5 text-accent flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleMainPurchase}
              disabled={isProcessing}
              className="w-full bg-primary text-primary-foreground font-semibold py-6 text-lg hover:border-2 hover:border-accent transition-all"
            >
              {isProcessing ? 'Processing...' : 'Get Complete Package'}
            </Button>
          </div>

          {/* Objection Options */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Not quite ready?</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  handleObjectionSelect('too_expensive')
                  setShowObjectionOptions(true)
                }}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                That's too expensive
              </button>
              <button
                onClick={() => {
                  handleObjectionSelect('not_ready')
                  setShowObjectionOptions(true)
                }}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                I'm not quite ready
              </button>
              <button
                onClick={() => {
                  handleObjectionSelect('all_options')
                  setShowObjectionOptions(true)
                }}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Show me all options
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Objection-specific offers */
        <div className="space-y-4">
          <button
            onClick={handleBackToSelections}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to main offer
          </button>

          {selectedObjection === 'too_expensive' && (
            <div className="bg-amber-600/10 rounded-xl p-6 border border-amber-600/30">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-6 w-6 text-amber-600" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Implementation Guidebook
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start with the essentials
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-amber-600">$29</span>
                <span className="text-muted-foreground">one-time</span>
              </div>

              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4 text-accent" />
                  Complete implementation guide
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4 text-accent" />
                  Your generated code
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4 text-accent" />
                  Raw recordings included free
                </li>
                <li className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  Polished video course in progress
                </li>
              </ul>

              <p className="text-xs text-accent mb-4">
                This $29 rolls over to any future upgrade!
              </p>

              <Button
                onClick={() => handleObjectionPurchase('guidebook')}
                disabled={isProcessing}
                className="w-full bg-amber-600 text-white hover:border-2 hover:border-accent transition-all"
              >
                {isProcessing ? 'Processing...' : 'Get Guidebook - $29'}
              </Button>
            </div>
          )}

          {selectedObjection === 'not_ready' && (
            <div className="bg-primary/10 rounded-xl p-6 border border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Save Your Progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Lock in your preview with the guidebook
                  </p>
                </div>
              </div>

              <div className="bg-primary/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground">
                  <strong>Note:</strong> Your preview code will be removed after 7 days for storage purposes.
                  Purchase the guidebook to save it permanently, and the $29 rolls over when you upgrade!
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-primary">$29</span>
                <span className="text-muted-foreground">rolls over to any upgrade</span>
              </div>

              <Button
                onClick={() => handleObjectionPurchase('guidebook')}
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground hover:border-2 hover:border-accent transition-all"
              >
                {isProcessing ? 'Processing...' : 'Save My Progress - $29'}
              </Button>
            </div>
          )}

          {selectedObjection === 'all_options' && (
            <div className="space-y-4">
              {/* Guidebook */}
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Guidebook Only</span>
                  </div>
                  <span className="font-bold text-foreground">$29</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Code + Implementation guide + Raw recordings
                </p>
                <Button
                  onClick={() => handleObjectionPurchase('guidebook')}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  Select
                </Button>
              </div>

              {/* Complete Package */}
              <div className="bg-primary/10 rounded-xl p-4 border-2 border-primary">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Complete Package</span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Popular</span>
                  </div>
                  <span className="font-bold text-primary">$190</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Everything in Guidebook + 30 AI customizations + Video course + Support
                </p>
                <Button
                  onClick={handleMainPurchase}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:border-2 hover:border-accent transition-all"
                >
                  Select
                </Button>
              </div>

              {/* Premium Options Coming Soon */}
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/30 opacity-75">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-accent" />
                    <span className="font-medium text-foreground">Premium Courses</span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                  <span className="font-bold text-accent">$390+</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Live group courses, 1-on-1 coaching, and advanced workshops. Dates announced shortly.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
