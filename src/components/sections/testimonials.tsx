'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

export function Testimonials() {
  const [name, setName] = useState('')
  const [testimonial, setTestimonial] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Connect to Airtable for testimonial submissions
    // Simulate submission for now
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setName('')
      setTestimonial('')
      
      // Reset form after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000)
    }, 1000)
  }

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What People Are Saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real feedback from real people (and friends who can't escape honest reviews)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Example Testimonial */}
          <Card className="relative">
            <CardContent className="p-8">
              <Quote className="h-8 w-8 text-primary mb-4" />
              <blockquote className="text-lg mb-6 italic">
                "I've known Matt for a while, and I guess he's crossed the threshold to being a friend at this point... unfortunately."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">😅</span>
                </div>
                <div>
                  <div className="font-semibold">One of Matt's Friends</div>
                  <div className="text-sm text-muted-foreground">Reluctant Testimonial Provider</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial Form */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Share Your Experience
              </h3>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🙏</div>
                  <h4 className="font-semibold mb-2">Thanks for your testimonial!</h4>
                  <p className="text-muted-foreground">
                    We appreciate your feedback and will review it soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="testimonial" className="block text-sm font-medium mb-2">
                      Your Testimonial
                    </label>
                    <Textarea
                      id="testimonial"
                      placeholder="Tell us about your experience... (humor appreciated but not required!)"
                      value={testimonial}
                      onChange={(e) => setTestimonial(e.target.value)}
                      required
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    By submitting, you agree to let us use your testimonial on our website.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}