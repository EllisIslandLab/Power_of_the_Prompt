"use client"

import { ServicesDisplay } from "@/components/services/ServicesDisplay"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Professional Web Development Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From learning the fundamentals to getting a custom website built, 
            I offer comprehensive solutions for every stage of your web development journey.
          </p>
        </div>

        {/* Services Display with Filters */}
        <ServicesDisplay showFilters={true} />

        {/* Additional Information */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Learn at Your Pace</h3>
            <p className="text-muted-foreground text-sm">
              Self-paced courses with lifetime access and real-world projects.
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-muted-foreground text-sm">
              Quick turnaround times without compromising on quality or attention to detail.
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Ongoing Support</h3>
            <p className="text-muted-foreground text-sm">
              Get help when you need it with responsive support and follow-up assistance.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 border">
          <h2 className="text-2xl font-bold mb-4">
            Not Sure Which Service Is Right for You?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Book a free 15-minute consultation to discuss your goals and get personalized recommendations 
            for your web development journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/consultation" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Book Free Consultation
            </a>
            <a 
              href="/#email-signup" 
              className="inline-flex items-center justify-center px-6 py-3 border border-muted text-base font-medium rounded-md text-foreground bg-background hover:bg-muted transition-colors"
            >
              Get Contact Info
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}