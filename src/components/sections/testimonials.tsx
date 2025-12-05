'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Quote, X, ChevronLeft, ChevronRight } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  testimonial: string
  title: string
  avatar: string
  email: string
  submittedDate: string
  updatedDate: string
  arrangement: number
}

export function Testimonials() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [testimonial, setTestimonial] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedWithEmail, setSubmittedWithEmail] = useState(false)
  const [error, setError] = useState('')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const testimonialsPerPage = 6

  // Fetch testimonials from Airtable
  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials')
      const data = await response.json()
      
      if (data.success) {
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoadingTestimonials(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Submit testimonial to Airtable
      const testimonialResponse = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          testimonial: testimonial.trim(),
        }),
      })

      const testimonialData = await testimonialResponse.json()

      if (!testimonialResponse.ok) {
        throw new Error(testimonialData.error || 'Something went wrong')
      }

      // If email was provided, also sign up for early access
      if (email.trim()) {
        try {
          await fetch('/api/waitlist/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email.trim() }),
          })
          // Note: We don't throw errors for waitlist signup failures
          // since the main testimonial submission succeeded
        } catch (waitlistError) {
          console.warn('Waitlist signup failed:', waitlistError)
          // Continue with success flow - testimonial was still submitted
        }
      }

      setIsSubmitted(true)
      setSubmittedWithEmail(!!email.trim())
      setName('')
      setEmail('')
      setTestimonial('')
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setSubmittedWithEmail(false)
      }, 5000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What People Are Saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Real feedback from real people (and friends who can't escape honest reviews)
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left Side - Featured Testimonials */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">Featured Testimonials</h3>
            
            <div className="space-y-6">
              {/* Example Testimonial - Always show this one */}
              <Card className="relative">
                <CardContent className="p-6">
                  <Quote className="h-6 w-6 text-primary mb-3" />
                  <blockquote className="text-base mb-4 italic">
                    "I've known Matt for a few years, so I guess that moves him from acquaintance to friend at this point."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm">😅</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">One of Matt's Friends</div>
                      <div className="text-xs text-muted-foreground">Friend</div>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* View More Button */}
              <div className="text-center">
                <Button
                  onClick={() => setShowModal(true)}
                  variant="outline"
                  className="w-full"
                  disabled={loadingTestimonials}
                >
                  {loadingTestimonials ? 'Loading...' : `View More Testimonials ${testimonials.length > 0 ? `(${testimonials.length})` : ''}`}
                </Button>

                {/* Referral CTA */}
                <div className="mt-4">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <a href="/badge-demo?highlight=true">
                      <span className="mr-2">💰</span>
                      Earn Up To $250 Per Referral!
                    </a>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Learn about our affiliate program
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Testimonial Form */}
          <div>
            <Card>
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Share Your Experience
              </h3>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🙏</div>
                  <h4 className="font-semibold mb-2">Thanks for your testimonial!</h4>
                  <p className="text-muted-foreground mb-2">
                    We appreciate your feedback and will review it soon.
                  </p>
                  {submittedWithEmail ? (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                      <p className="text-sm text-primary font-medium">
                        🚀 You've also been signed up for early access updates!
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700 font-medium">
                        💡 If you haven't already, don't forget to sign up for the launch!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name *
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
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email (optional)
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Providing your email signs you up for early access updates and allows you to edit your testimonial later
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="testimonial" className="block text-sm font-medium mb-2">
                      Your Testimonial *
                    </label>
                    <Textarea
                      id="testimonial"
                      placeholder="Tell us about your experience... (humor appreciated but not required!)"
                      value={testimonial}
                      onChange={(e) => setTestimonial(e.target.value)}
                      required
                      rows={4}
                      minLength={10}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {testimonial.length}/1000 characters
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

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
      </div>

      {/* Testimonials Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">All Testimonials</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {loadingTestimonials ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={`loading-${i}`}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="w-6 h-6 bg-muted rounded mb-3"></div>
                          <div className="space-y-2 mb-4">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="space-y-1">
                              <div className="h-3 bg-muted rounded w-20"></div>
                              <div className="h-3 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : testimonials.length === 0 ? (
                <div className="text-center py-12">
                  <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No testimonials available yet.</p>
                  <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
                </div>
              ) : (
                <>
                  {/* Testimonials Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials
                      .slice((currentPage - 1) * testimonialsPerPage, currentPage * testimonialsPerPage)
                      .map((testimonial) => (
                        <Card key={testimonial.id}>
                          <CardContent className="p-6">
                            <Quote className="h-6 w-6 text-primary mb-3" />
                            <blockquote className="text-base mb-4 italic">
                              "{testimonial.testimonial}"
                            </blockquote>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm">{testimonial.avatar}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{testimonial.name}</div>
                                <div className="text-xs text-muted-foreground">{testimonial.title}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(testimonials.length / testimonialsPerPage) > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {Math.ceil(testimonials.length / testimonialsPerPage)} 
                        ({testimonials.length} testimonials)
                      </span>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(testimonials.length / testimonialsPerPage), prev + 1))}
                        disabled={currentPage === Math.ceil(testimonials.length / testimonialsPerPage)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}