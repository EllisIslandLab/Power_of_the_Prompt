'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Mail, UserPlus, Crown, Users } from 'lucide-react'

export default function AdminInvitesPage() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    tier: 'free',
    expiresInDays: '7'
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{
    signupUrl: string
    email: string
    tier: string
  } | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/generate-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName || null,
          tier: formData.tier,
          expiresInDays: parseInt(formData.expiresInDays),
          createdBy: 'admin' // In a real app, this would be the current admin's ID
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite')
      }

      setSuccess({
        signupUrl: data.invite.signup_url,
        email: formData.email,
        tier: formData.tier
      })

      // Reset form
      setFormData({
        email: '',
        fullName: '',
        tier: 'free',
        expiresInDays: '7'
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const sendEmailInvite = (email: string, signupUrl: string, tier: string) => {
    const subject = encodeURIComponent('Your Web Launch Academy Invitation')
    const body = encodeURIComponent(
      `You've been invited to join Web Launch Academy with ${tier === 'full' ? 'Full Access' : 'Free Tier'} privileges!\n\n` +
      `Click here to create your account:\n${signupUrl}\n\n` +
      `This invitation will expire in 7 days.\n\n` +
      `Best regards,\nWeb Launch Academy Team`
    )
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <UserPlus className="h-8 w-8" />
            Student Invite Management
          </h1>
          <p className="text-xl text-muted-foreground">
            Create secure invitations for committed students
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Invite Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Create New Invite
              </CardTitle>
              <CardDescription>
                Generate a secure signup link for a committed student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Student Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="student@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (Optional)</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Pre-fill student's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">Access Level *</Label>
                  <Select 
                    value={formData.tier} 
                    onValueChange={(value) => handleChange('tier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Free Tier - Basic Access
                        </div>
                      </SelectItem>
                      <SelectItem value="full">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Full Access - Premium Features
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">Expires In (Days)</Label>
                  <Select 
                    value={formData.expiresInDays} 
                    onValueChange={(value) => handleChange('expiresInDays', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days (Default)</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating Invite...' : 'Generate Invite Link'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Success Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Invite Created
              </CardTitle>
              <CardDescription>
                Share this secure link with the student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      ✅ Invite created for <strong>{success.email}</strong> with{' '}
                      <strong>{success.tier === 'full' ? 'Full Access' : 'Free Tier'}</strong> privileges
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Signup URL</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={success.signupUrl}
                        readOnly
                        rows={3}
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(success.signupUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => sendEmailInvite(success.email, success.signupUrl, success.tier)}
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email Invite
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(success.signupUrl)}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Create an invite to see the signup link here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Invite System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">🔒 Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  Only students with valid invite tokens can signup. No public registration allowed.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">⭐ Tier Management</h3>
                <p className="text-sm text-muted-foreground">
                  Choose Free (basic access) or Full (premium features) based on student's commitment level.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">📧 Email Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Send invites via email after consultations or when students commit to payment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}