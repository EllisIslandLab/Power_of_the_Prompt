"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Calendar, FileText, Zap } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (paymentIntentId) {
      // In a real implementation, you might fetch payment details
      // For now, we'll just show a generic success message
      setLoading(false)
    }
  }, [paymentIntentId])

  const getNextSteps = (serviceType: string) => {
    switch (serviceType) {
      case 'course':
        return [
          {
            icon: <Mail className="h-5 w-5 text-blue-500" />,
            title: "Check Your Email",
            description: "You'll receive login credentials and course access within 10 minutes."
          },
          {
            icon: <FileText className="h-5 w-5 text-green-500" />,
            title: "Access Course Materials",
            description: "Log into your student portal to begin the course immediately."
          }
        ]
      
      case 'consultation':
        return [
          {
            icon: <Mail className="h-5 w-5 text-blue-500" />,
            title: "Confirmation Email Sent",
            description: "Check your email for booking instructions and next steps."
          },
          {
            icon: <Calendar className="h-5 w-5 text-purple-500" />,
            title: "Schedule Your Session",
            description: "I'll reach out within 24 hours to schedule your consultation."
          }
        ]
      
      case 'audit':
        return [
          {
            icon: <Mail className="h-5 w-5 text-blue-500" />,
            title: "Audit Questionnaire",
            description: "You'll receive a detailed questionnaire about your website within 2 hours."
          },
          {
            icon: <FileText className="h-5 w-5 text-orange-500" />,
            title: "Audit Delivery",
            description: "Your comprehensive audit report will be delivered within 3-5 business days."
          }
        ]
      
      case 'build':
        return [
          {
            icon: <Mail className="h-5 w-5 text-blue-500" />,
            title: "Project Kickoff",
            description: "You'll receive a welcome email with onboarding materials within 4 hours."
          },
          {
            icon: <Calendar className="h-5 w-5 text-green-500" />,
            title: "Discovery Call",
            description: "I'll schedule a discovery call to discuss your project requirements."
          }
        ]
      
      default:
        return [
          {
            icon: <Mail className="h-5 w-5 text-blue-500" />,
            title: "Confirmation Email",
            description: "Check your email for next steps and additional information."
          }
        ]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {paymentIntentId && (
            <p className="text-sm text-muted-foreground mt-2">
              Payment ID: {paymentIntentId}
            </p>
          )}
        </div>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              What Happens Next
            </CardTitle>
            <CardDescription>
              Here's what you can expect in the coming hours and days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getNextSteps('consultation').map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              If you have any questions or concerns about your purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Email:</strong> hello@poweroftheprompt.com
              </p>
              <p className="text-sm">
                <strong>Response Time:</strong> Within 24 hours
              </p>
              <p className="text-sm text-muted-foreground">
                Don't forget to check your spam folder for important emails!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <a href="/portal">
              Go to Student Portal
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/">
              Return to Homepage
            </a>
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-blue-800 mb-1">
                Your receipt has been sent to your email address.
              </p>
              <p className="text-blue-700">
                Keep this for your records. If you need a copy of your receipt later, 
                you can always contact us and we'll resend it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServiceSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}