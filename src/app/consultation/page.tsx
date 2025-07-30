"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Calendar, Phone, Mail, Clock, CheckCircle, ArrowRight } from "lucide-react"

export default function ConsultationPage() {
  const [selectedOption, setSelectedOption] = useState<'calendar' | 'form' | null>(null)
  const [nextAvailable, setNextAvailable] = useState("Loading...")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    websiteDescription: "", // For calendar booking
    businessType: "",
    currentWebsite: "",
    currentHost: "",
    monthlyCosts: "",
    whyInterested: "",
    biggestChallenge: "",
    timeline: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Fetch next available slot
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch('/api/calendly/availability')
        if (response.ok) {
          const data = await response.json()
          setNextAvailable(data.next_available)
        } else {
          // Fallback for demo
          const mockDate = new Date(Date.now() + (4 * 60 * 60 * 1000)) // 4 hours from now
          const options: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
          }
          setNextAvailable(mockDate.toLocaleDateString('en-US', options))
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
        setNextAvailable("Today 2:30 PM EST")
      }
    }
    
    fetchAvailability()
    // Update every 15 minutes
    const interval = setInterval(fetchAvailability, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bookingType: selectedOption,
          submittedAt: new Date().toISOString()
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSubmitted(true)
      } else {
        setError(result.error || "Failed to submit consultation request")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-card rounded-lg shadow-lg p-8 border">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">
              {selectedOption === 'calendar' ? 'Consultation Confirmed!' : 'Request Received!'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {selectedOption === 'calendar' 
                ? "Check your email for the Zoom link and calendar invite. I'm looking forward to talking with you!"
                : "I'll reach out within your preferred timeline. Keep an eye on your email and phone!"
              }
            </p>
            <Button asChild>
              <a href="/">Return to Homepage</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedOption) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Book Your Free Consultation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              30 minutes to plan your website strategy and see if we're a good fit
            </p>
          </div>

          {/* Main Layout: 70/30 split */}
          <div className="grid lg:grid-cols-10 gap-8">
            {/* Left Side: Booking Options (70%) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Option 1: Priority Calendar Booking */}
              <Card className="ring-2 ring-primary shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => setSelectedOption('calendar')}>
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8" />
                    <div>
                      <CardTitle className="text-2xl">🗓️ Schedule Your Call Now</CardTitle>
                      <CardDescription className="text-primary-foreground/90 text-base">
                        Pick a time that works for you - I'll call you then
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Available Times:</h4>
                        <div className="space-y-1 text-sm text-green-700">
                          <div>Morning: 6:00 AM - 10:00 AM EST</div>
                          <div>Afternoon: 2:00 PM - 6:00 PM EST</div>
                          <div className="text-xs text-green-600 mt-2">3+ hour advance booking required</div>
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Instant confirmation with calendar invite
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Automatic Zoom meeting link
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Email reminders before your call
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <Button size="lg" className="w-full">
                        Choose Your Time <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Option 2: Secondary Call Back */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-secondary" onClick={() => setSelectedOption('form')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Phone className="h-6 w-6 text-secondary" />
                    <div>
                      <CardTitle className="text-xl">📞 Or I'll Call You</CardTitle>
                      <CardDescription>
                        Can't find a good time? I'll reach out based on your preference
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• ASAP (within 24 hours)</div>
                      <div>• This week (I'll find a good time)</div>
                      <div>• Just exploring (I'll follow up when convenient)</div>
                    </div>
                    <Button variant="outline" size="lg">
                      Request Call Back <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Availability & Contact (30%) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Dynamic Availability */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Next Available</h3>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {nextAvailable}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Times shown in Eastern Time
                  </p>
                </CardContent>
              </Card>

              {/* Minimal Contact */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="h-6 w-6 text-secondary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Questions about booking?</h4>
                  <p className="text-sm text-muted-foreground">
                    Email hello@poweroftheprompt.com
                  </p>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Website Strategy</div>
                      <div className="text-muted-foreground text-xs">Custom recommendations for your business</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">No Pressure</div>
                      <div className="text-muted-foreground text-xs">Just valuable insights you can use</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Next Steps</div>
                      <div className="text-muted-foreground text-xs">Clear action plan via email</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calendar Integration View
  if (selectedOption === 'calendar') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedOption(null)}
              className="mb-4"
            >
              ← Back to Options
            </Button>
            <h1 className="text-3xl font-bold mb-4">Schedule Your Consultation</h1>
            <p className="text-muted-foreground">
              Choose a time that works best for you. You'll receive an instant confirmation with meeting details.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Widget */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  {/* Calendly Embed Placeholder */}
                  <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[500px] flex items-center justify-center">
                    <div>
                      <Calendar className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Calendar Integration</h3>
                      <p className="text-muted-foreground mb-4">
                        Calendly widget will be embedded here
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1 mb-4">
                        <div>Available: 6:00-10:00 AM & 2:00-6:00 PM EST</div>
                        <div>30-minute sessions</div>
                        <div>3+ hour minimum notice</div>
                        <div>Automatic Zoom meeting generation</div>
                      </div>
                      
                      {/* Quick Form for Calendar Booking */}
                      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 text-left">
                        <h4 className="font-semibold text-center mb-4">Required for Booking:</h4>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Full Name"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg text-sm"
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email Address"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg text-sm"
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          name="businessName"
                          placeholder="Business Name"
                          required
                          value={formData.businessName}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg text-sm"
                        />
                        <textarea
                          name="websiteDescription"
                          placeholder="What type of website are you considering?"
                          rows={3}
                          value={formData.websiteDescription}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg text-sm"
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Booking..." : "Simulate Booking (Demo)"}
                        </Button>
                      </form>
                    </div>
                  </div>
                  {/* 
                  To implement Calendly, replace the above div with:
                  <div dangerouslySetInnerHTML={{
                    __html: '<div class="calendly-inline-widget" data-url="https://calendly.com/your-calendar-link?hide_gdpr_banner=1" style="min-width:320px;height:500px;"></div>'
                  }} />
                  
                  And add this script tag to your layout:
                  <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
                  */}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Instant Confirmation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    Email confirmation sent immediately
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    Calendar invite with Zoom link
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    Automatic reminder 24 hours before
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {nextAvailable}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Next available slot
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need to Reschedule?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No problem! You can reschedule or cancel up to 2 hours before your appointment using the link in your confirmation email.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Form-based Scheduling View
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedOption(null)}
            className="mb-4"
          >
            ← Back to Options
          </Button>
          <h1 className="text-3xl font-bold mb-4">Request Your Consultation</h1>
          <p className="text-muted-foreground">
            Tell us about your business and I'll reach out based on your preference.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Required Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your business name"
                    />
                  </div>
                </div>
              </div>

              {/* Optional but Helpful Fields */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-secondary">Optional but Helpful</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Business Type
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="service">Service-based</option>
                      <option value="product">Product-based</option>
                      <option value="nonprofit">Non-profit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Website
                    </label>
                    <input
                      type="url"
                      name="currentWebsite"
                      value={formData.currentWebsite}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Leave blank if none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Host
                    </label>
                    <select
                      name="currentHost"
                      value={formData.currentHost}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select host</option>
                      <option value="none">None</option>
                      <option value="squarespace">Squarespace</option>
                      <option value="wix">Wix</option>
                      <option value="wordpress">WordPress</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Monthly Website Costs
                    </label>
                    <select
                      name="monthlyCosts"
                      value={formData.monthlyCosts}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Current monthly spending</option>
                      <option value="0">$0</option>
                      <option value="1-50">$1-50</option>
                      <option value="51-100">$51-100</option>
                      <option value="100+">$100+</option>
                      <option value="not-sure">Not sure</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Business Questions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-secondary">Tell Me More</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Why are you interested in building a website?
                  </label>
                  <textarea
                    name="whyInterested"
                    value={formData.whyInterested}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell me about your goals, what you hope to achieve..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    What's your biggest website challenge currently?
                  </label>
                  <textarea
                    name="biggestChallenge"
                    value={formData.biggestChallenge}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="What's holding you back? Technical issues, costs, time, knowledge?"
                  />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Timeline for Call Back *
                </label>
                <select
                  name="timeline"
                  required
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">When should I contact you?</option>
                  <option value="asap">ASAP (within 24 hours)</option>
                  <option value="this-week">This week (I'll find a good time)</option>
                  <option value="exploring">Just exploring (I'll follow up when convenient)</option>
                </select>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Request My Free Consultation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}