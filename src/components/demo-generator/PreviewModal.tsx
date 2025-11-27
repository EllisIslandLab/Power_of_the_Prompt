'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink, BookOpen, Calendar, Loader2, ArrowLeft, RefreshCw, Sparkles, Lightbulb, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import PaymentModal from './PaymentModal'

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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showTipsSection, setShowTipsSection] = useState(false)
  const [showGeneralTips, setShowGeneralTips] = useState(false)
  const [tipsEmail, setTipsEmail] = useState('')
  const [isSendingTips, setIsSendingTips] = useState(false)

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

  const handleAICustomize = () => {
    if (!hasAdditionalDetails) {
      toast.error('Please go back and add enhancement details or select tools for at least one service to use AI customization')
      return
    }

    // Open payment modal instead of calling API directly
    setShowPaymentModal(true)
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

  const handleSendPersonalizedTips = async () => {
    if (!tipsEmail || !tipsEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSendingTips(true)
    try {
      // TODO: Call API to send personalized tips email
      await fetch('/api/demo-generator/send-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tipsEmail,
          demoProjectId: previewData.demoProjectId,
        }),
      })

      toast.success('Personalized tips sent to your email!')
      setTipsEmail('')
    } catch (error) {
      console.error('Failed to send tips:', error)
      toast.error('Failed to send tips. Please try again.')
    } finally {
      setIsSendingTips(false)
    }
  }

  const displayHTML = customizedHTML || previewData.html

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {customizedHTML ? '⚡ AI-Customized Preview' : 'Your Website Preview is Ready!'}
          </DialogTitle>
          <DialogDescription>
            {customizedHTML
              ? 'This preview has been AI-customized based on your vision. Purchase the code below to receive it via email.'
              : 'Below is a live preview of your website. Make changes by going back, or upgrade with AI customization for a unique design tailored to your vision.'}
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

        {/* Tips Section */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGeneralTips(!showGeneralTips)}
              className="gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              General Tips to Improve Your Preview
              {showGeneralTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTipsSection(!showTipsSection)}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Get Personalized Tips
              {showTipsSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* General Tips Dropdown */}
          {showGeneralTips && (
            <Card className="border-muted bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="pt-6 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Tips to Improve Your Website Preview
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Refine your services:</strong> Add specific, actionable descriptions that highlight the value you provide to clients.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Choose contrasting colors:</strong> Ensure your primary and accent colors have good contrast for readability.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Add tools wisely:</strong> Select predetermined tools that align with your business goals and customer needs.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Include contact info:</strong> Make it easy for potential clients to reach you with clear phone and email.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Use AI customization:</strong> For advanced features, consider upgrading to AI Premium with your specific requirements.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Personalized Tips Email Input */}
          {showTipsSection && (
            <Card className="border-muted bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="pt-6 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  Get Personalized Tips via Email
                </h4>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive personalized recommendations on how to improve your website preview based on your specific business and services.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="tips-email" className="sr-only">Email address</Label>
                    <Input
                      id="tips-email"
                      type="email"
                      placeholder="your@email.com"
                      value={tipsEmail}
                      onChange={(e) => setTipsEmail(e.target.value)}
                      disabled={isSendingTips}
                    />
                  </div>
                  <Button
                    onClick={handleSendPersonalizedTips}
                    disabled={isSendingTips || !tipsEmail}
                  >
                    {isSendingTips ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Tips
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional: We'll analyze your preview and send tailored suggestions to help you create a better website.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        demoProjectId={previewData.demoProjectId}
      />
    </Dialog>
  )
}
