"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // You could fetch session details from Stripe if needed
      // For now, we'll just show a success message
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-2xl text-center">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase! We've received your payment and you should receive 
              a confirmation email shortly.
            </p>
            
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  You'll receive a confirmation email with your receipt
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Course access details will be sent within 24 hours
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Check your spam folder if you don't see our emails
                </li>
              </ul>
            </div>
            
            {sessionId && (
              <div className="text-sm text-muted-foreground">
                Order ID: {sessionId}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild>
                <Link href="/portal">
                  Access Course Portal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}