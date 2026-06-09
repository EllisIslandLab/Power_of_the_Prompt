'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Mail, UserPlus } from 'lucide-react'

export default function AdminInvitesPage() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    expiresInDays: '7',
    initialBalance: '0',
    discountPercentage: '0',
    discountDurationDays: '0'
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{
    signupUrl: string
    email: string
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
          expiresInDays: parseInt(formData.expiresInDays),
          initialBalance: parseFloat(formData.initialBalance) || 0,
          discountPercentage: parseInt(formData.discountPercentage) || 0,
          discountDurationDays: parseInt(formData.discountDurationDays) || 0,
          createdBy: 'admin' // In a real app, this would be the current admin's ID
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite')
      }

      setSuccess({
        signupUrl: data.invite.signup_url,
        email: formData.email
      })

      // Reset form
      setFormData({
        email: '',
        fullName: '',
        expiresInDays: '7',
        initialBalance: '0',
        discountPercentage: '0',
        discountDurationDays: '0'
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

  const copySignupLink = (signupUrl: string) => {
    navigator.clipboard.writeText(signupUrl)
    // You could add a toast notification here
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

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3">Account Benefits (Optional)</h3>

                  <div className="space-y-2">
                    <Label htmlFor="initialBalance">Initial Balance ($)</Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.initialBalance}
                      onChange={(e) => handleChange('initialBalance', e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">Upfront credit for token usage</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => handleChange('discountPercentage', e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">e.g., 90 for 90% off token usage</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountDuration">Discount Duration (Days)</Label>
                    <Select
                      value={formData.discountDurationDays}
                      onValueChange={(value) => handleChange('discountDurationDays', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Discount</SelectItem>
                        <SelectItem value="7">1 Week</SelectItem>
                        <SelectItem value="14">2 Weeks</SelectItem>
                        <SelectItem value="30">1 Month</SelectItem>
                        <SelectItem value="60">2 Months</SelectItem>
                        <SelectItem value="90">3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">How long the discount is valid</p>
                  </div>
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
                      <Mail className="h-4 w-4 inline mr-1" />
                      <strong>Invite created and email sent!</strong> Invitation sent to <strong>{success.email}</strong>
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
                      variant="outline"
                      onClick={() => copySignupLink(success.signupUrl)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Invite Link
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
                <h3 className="font-semibold text-foreground">Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  Only students with valid invite tokens can signup. No public registration allowed.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Tier Management</h3>
                <p className="text-sm text-muted-foreground">
                  Choose Free (basic access) or Full (premium features) based on student's commitment level.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Email Integration</h3>
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