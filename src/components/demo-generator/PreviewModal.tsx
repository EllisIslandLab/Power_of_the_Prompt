'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, BookOpen, Calendar, Loader2, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  hasAdditionalDetails: boolean
  previewData: {
    demoProjectId: string
    html: string
    businessName: string
  }
}

export default function PreviewModal({ isOpen, onClose, onBack, hasAdditionalDetails, previewData }: PreviewModalProps) {
  const [trackingViewed, setTrackingViewed] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [customizedHTML, setCustomizedHTML] = useState<string | null>(null)

  // Track preview view when modal opens
  useEffect(() => {
    if (isOpen && !trackingViewed && previewData.demoProjectId) {
      trackPreviewView()
      setTrackingViewed(true)
    }
  }, [isOpen, trackingViewed, previewData.demoProjectId])

  const trackPreviewView = async () => {
    try {
      await fetch('/api/demo-generator/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoProjectId: previewData.demoProjectId,
          interactionType: 'viewed_preview',
        }),
      })
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  const handleTextbookClick = async () => {
    try {
      await fetch('/api/demo-generator/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoProjectId: previewData.demoProjectId,
          interactionType: 'clicked_textbook',
        }),
      })

      // Redirect to textbook purchase page (update with actual URL)
      window.open('/portal/store', '_blank')
    } catch (error) {
      console.error('Failed to track click:', error)
      window.open('/portal/store', '_blank')
    }
  }

  const handleBookCallClick = async () => {
    try {
      await fetch('/api/demo-generator/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoProjectId: previewData.demoProjectId,
          interactionType: 'clicked_book_call',
        }),
      })

      // Redirect to booking page (update with actual Calendly link or booking page)
      window.open('https://calendly.com/weblaunchacademy', '_blank')
    } catch (error) {
      console.error('Failed to track click:', error)
      window.open('https://calendly.com/weblaunchacademy', '_blank')
    }
  }

  const handleAICustomize = async () => {
    if (!hasAdditionalDetails) {
      toast.error('Please go back and add details about your vision in Step 3 to use AI customization')
      return
    }

    setIsCustomizing(true)
    try {
      const response = await fetch('/api/demo-generator/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoProjectId: previewData.demoProjectId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI customization failed')
      }

      const result = await response.json()
      setCustomizedHTML(result.html)
      toast.success('Your site has been AI-customized based on your vision!')
    } catch (error: any) {
      console.error('AI customization error:', error)
      toast.error(error.message || 'Failed to customize with AI. Please try again.')
    } finally {
      setIsCustomizing(false)
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      // Regenerate by calling customize again if already customized, or just reload
      if (customizedHTML) {
        await handleAICustomize()
      } else {
        // Reload the original preview
        setCustomizedHTML(null)
        toast.info('Preview reloaded')
      }
    } finally {
      setIsRegenerating(false)
    }
  }

  const displayHTML = customizedHTML || previewData.html

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {customizedHTML ? '✨ AI-Customized Preview' : 'Your Website Preview is Ready!'}
          </DialogTitle>
          <DialogDescription>
            {customizedHTML
              ? 'This preview has been AI-customized based on your vision. Check your email for the link.'
              : 'Below is a live preview of your website. Upgrade with AI customization for a unique design tailored to your vision.'}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isCustomizing || isRegenerating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>

          {!customizedHTML && (
            <Button
              onClick={handleAICustomize}
              disabled={isCustomizing || isRegenerating || !hasAdditionalDetails}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isCustomizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Customizing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Customize (Premium)
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isCustomizing || isRegenerating}
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>

          {!hasAdditionalDetails && (
            <p className="text-xs text-muted-foreground flex items-center ml-auto">
              💡 Add your vision in Step 3 to enable AI customization
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Preview Iframe */}
          <div className="flex-1 overflow-auto border rounded-lg bg-white relative">
            {(isCustomizing || isRegenerating) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold">
                    {isCustomizing ? 'AI is customizing your site...' : 'Regenerating...'}
                  </p>
                  <p className="text-sm text-muted-foreground">This may take 10-30 seconds</p>
                </div>
              </div>
            )}
            <iframe
              srcDoc={displayHTML}
              className="w-full h-full"
              title="Website Preview"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>

          {/* CTA Section */}
          <div className="lg:w-80 space-y-4 overflow-auto">
            <Card className="border-primary shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Love Your Preview?</CardTitle>
                <CardDescription>
                  Take the next step to launch your real website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Option 1: Buy Walkthrough Guide + Code Access */}
                <Card className="border-primary/30 border-2 bg-primary/5 hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                      INCLUDES YOUR CODE
                    </div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Get Your Code + Walkthrough Guide</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Download the exact HTML/CSS code from your preview PLUS our step-by-step walkthrough guide to deploy and customize it
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3">
                          <p className="text-xs font-semibold text-yellow-800">
                            ⏰ Your code expires in 24 hours!
                          </p>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold text-primary">$9</span>
                          <span className="text-sm text-muted-foreground">one-time</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleTextbookClick} className="w-full">
                      Get Code & Guide
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Option 2: Book Free Call */}
                <Card className="border-muted hover:border-accent transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Get Expert Help</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Book a free demo call to discuss how we can build and launch your website for you
                        </p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold text-accent">Free</span>
                          <span className="text-sm text-muted-foreground">30-min call</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleBookCallClick}
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      Book Free Call
                      <Calendar className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="text-xs text-muted-foreground text-center pt-2">
                  <p>Questions? Email us at hello@weblaunchacademy.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
