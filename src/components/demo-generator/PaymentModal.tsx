'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Loader2, Sparkles, Package } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  demoProjectId: string
}

export default function PaymentModal({ isOpen, onClose, demoProjectId }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'demo' | 'bundle' | null>(null)

  const handleCheckout = async (tier: 'demo' | 'bundle') => {
    setIsProcessing(true)
    setSelectedTier(tier)

    try {
      const response = await fetch('/api/demo-generator/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoProjectId,
          tier,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to start checkout. Please try again.')
      setIsProcessing(false)
      setSelectedTier(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Upgrade to AI-Enhanced Preview
          </DialogTitle>
          <DialogDescription>
            Choose your preferred option to unlock AI-powered customization
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Option 1: AI Premium Demo Only */}
          <Card className="border-2 hover:border-primary transition-colors relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              POPULAR
            </div>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">AI Premium Demo</h3>
                  <p className="text-sm text-muted-foreground">AI-customized preview only</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-primary">$15</span>
                <span className="text-muted-foreground">one-time</span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">AI-generated custom HTML based on your vision</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Smart implementation of selected tools</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unique design tailored to your business</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">24-hour preview access</span>
                </div>
              </div>

              <Button
                onClick={() => handleCheckout('demo')}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {isProcessing && selectedTier === 'demo' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get AI Preview
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-2">
                Perfect for seeing your vision come to life
              </p>
            </CardContent>
          </Card>

          {/* Option 2: Bundle - AI Demo + Code + Guide */}
          <Card className="border-2 border-accent hover:border-accent/80 transition-colors relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
              BEST VALUE
            </div>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-accent to-orange-500 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Complete Bundle</h3>
                  <p className="text-sm text-muted-foreground">AI Demo + Code + Guide</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-accent">$25</span>
                <span className="text-muted-foreground">one-time</span>
                <span className="ml-auto text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  Save $14
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>Everything in AI Premium Demo</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Download your exact generated code (HTML/CSS)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Structured folder ready for deployment</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Step-by-step Walkthrough Guide</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Learn to connect external services (Airtable, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Deployment instructions included</span>
                </div>
              </div>

              <Button
                onClick={() => handleCheckout('bundle')}
                disabled={isProcessing}
                className="w-full bg-accent hover:bg-accent/90"
                size="lg"
              >
                {isProcessing && selectedTier === 'bundle' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get Complete Bundle
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-2">
                Best for DIY deployment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
            <span className="text-lg">⏰</span>
            <span>
              <strong>Reminder:</strong> Your demo code expires in 24 hours! After payment, you'll immediately see your AI-customized preview.
              {' '}<strong className="text-yellow-900 dark:text-yellow-100">Bundle customers</strong> get permanent access to download their code anytime.
            </span>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
