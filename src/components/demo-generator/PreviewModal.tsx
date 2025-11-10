'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, BookOpen, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewData: {
    demoProjectId: string
    html: string
    businessName: string
  }
}

export default function PreviewModal({ isOpen, onClose, previewData }: PreviewModalProps) {
  const [trackingViewed, setTrackingViewed] = useState(false)

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Your Website Preview is Ready!</DialogTitle>
          <DialogDescription>
            Check your email for the full preview link. Below is a live preview of your website.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Preview Iframe */}
          <div className="flex-1 overflow-auto border rounded-lg bg-white">
            <iframe
              srcDoc={previewData.html}
              className="w-full h-full"
              title="Website Preview"
              sandbox="allow-same-origin"
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
                {/* Option 1: Buy Textbook */}
                <Card className="border-muted hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Learn to Build It Yourself</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Get our comprehensive textbook and build your professional website step-by-step
                        </p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold text-primary">$9</span>
                          <span className="text-sm text-muted-foreground">one-time</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleTextbookClick} className="w-full">
                      Buy Textbook
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
