'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { CheckCircle, Crown, ArrowRight, Mail } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const email = searchParams.get('email')
  
  const [inviteData, setInviteData] = useState<{
    signupUrl: string
    email: string
    tier: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    const generateInviteForPayment = async () => {
      if (!sessionId || !email) {
        setError('Missing payment session information')
        setLoading(false)
        return
      }

      try {
        // Generate invite token for the paying customer
        const response = await fetch('/api/auth/generate-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            tier: 'full', // Paying customers get full access
            createdBy: 'payment-system',
            expiresInDays: 7
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create signup invitation')
        }

        setInviteData({
          signupUrl: data.invite.signup_url,
          email: email,
          tier: 'full'
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    generateInviteForPayment()
  }, [sessionId, email])

  const sendEmailInvite = async () => {
    if (!inviteData) return

    setEmailSent(true)
    // In a real implementation, you'd call an API to send the email
    // For now, we'll use mailto to open the user's email client
    
    const subject = encodeURIComponent('Complete Your Web Launch Academy Setup')
    const body = encodeURIComponent(
      `Thank you for your commitment to Web Launch Academy!\n\n` +
      `Your payment has been processed successfully and you now have Full Access privileges.\n\n` +
      `Complete your student account setup here:\n${inviteData.signupUrl}\n\n` +
      `What you get with Full Access:\n` +
      `✅ All course materials and premium content\n` +
      `✅ One-on-one coaching sessions\n` +
      `✅ Live group sessions\n` +
      `✅ Priority support\n` +
      `✅ Downloadable resources and certificates\n\n` +
      `This invitation will expire in 7 days, so please complete your setup soon.\n\n` +
      `Welcome to the academy!\n\n` +
      `Best regards,\nWeb Launch Academy Team`
    )
    
    window.open(`mailto:${inviteData.email}?subject=${subject}&body=${body}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Setup Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to Web Launch Academy - Full Access
          </p>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Your Full Access Account
            </CardTitle>
            <CardDescription>
              Complete your student account setup to access all premium features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What's Included */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">✅ Course Access</h3>
                <p className="text-sm text-muted-foreground">
                  All course materials, premium content, and future updates
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">✅ One-on-One Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Personal coaching and guidance tailored to your goals
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">✅ Live Group Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive workshops and Q&A sessions with other students
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">✅ Priority Support</h3>
                <p className="text-sm text-muted-foreground">
                  Fast-track support and direct access to instructors
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Next Step:</strong> Create your student account using the secure link below. 
                This will give you immediate access to all premium features.
              </p>
            </div>

            {/* Account Setup */}
            {inviteData && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Secure Signup Link</Label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-xs font-mono break-all text-gray-600">
                      {inviteData.signupUrl}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <Link href={inviteData.signupUrl}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Complete Account Setup
                    </Link>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={sendEmailInvite}
                    disabled={emailSent}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {emailSent ? 'Email Sent' : 'Email Me Link'}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Questions? Contact us at{' '}
                <a href="mailto:support@weblaunchacademy.com" className="text-primary hover:underline">
                  support@weblaunchacademy.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                Your signup link is secure and expires in 7 days. Complete your account setup as soon as possible.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                Use the email address <strong>{email}</strong> when creating your account.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                Save this page or email yourself the link in case you need it later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}