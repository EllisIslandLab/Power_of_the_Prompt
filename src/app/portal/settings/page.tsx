'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle, Plus, Trash2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface UserEmail {
  id: string
  email: string
  is_primary: boolean
  verified: boolean
  created_at: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Email management state
  const [emails, setEmails] = useState<UserEmail[]>([])
  const [showAddEmailDialog, setShowAddEmailDialog] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [makePrimary, setMakePrimary] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Username state
  const [username, setUsername] = useState('')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameMessage, setUsernameMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [fullName, setFullName] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Website URL state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteLoading, setWebsiteLoading] = useState(false)
  const [websiteMessage, setWebsiteMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Payment state
  const [invoices, setInvoices] = useState<any[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  // Tech stack preferences
  const [techStackPreferences, setTechStackPreferences] = useState<string[]>([])
  const [techStackLoading, setTechStackLoading] = useState(false)
  const [techStackMessage, setTechStackMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    fetchUserProfile()
    fetchEmails()
    fetchInvoices()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setUsername(data.user.username || '')
        setFullName(data.user.full_name || '')
        setWebsiteUrl(data.user.website_url || '')
        setTechStackPreferences(data.user.tech_stack_preferences || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/user/get-emails')
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails)
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
    }
  }

  const fetchInvoices = async () => {
    setInvoicesLoading(true)
    try {
      const response = await fetch('/api/stripe/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setInvoicesLoading(false)
    }
  }

  const openCustomerPortal = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          return_url: window.location.href
        })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open customer portal')
        setPortalLoading(false)
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
      alert('Failed to open customer portal')
      setPortalLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)
    setPasswordLoading(true)

    // Validation
    if (newPassword.length < 8) {
      setPasswordMessage({type: 'error', text: 'Password must be at least 8 characters'})
      setPasswordLoading(false)
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordMessage({type: 'error', text: 'Password must contain at least one uppercase letter'})
      setPasswordLoading(false)
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordMessage({type: 'error', text: 'Password must contain at least one number'})
      setPasswordLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({type: 'error', text: 'Passwords do not match'})
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordMessage({type: 'success', text: 'Password updated successfully!'})
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({type: 'error', text: data.error || 'Failed to update password'})
      }
    } catch (error) {
      setPasswordMessage({type: 'error', text: 'An error occurred'})
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAddEmail = async () => {
    setEmailMessage(null)
    setEmailLoading(true)

    try {
      const response = await fetch('/api/user/add-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, makePrimary })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailMessage({type: 'success', text: 'Email added successfully!'})
        setNewEmail('')
        setMakePrimary(false)
        setShowAddEmailDialog(false)
        fetchEmails()
      } else {
        setEmailMessage({type: 'error', text: data.error || 'Failed to add email'})
      }
    } catch (error) {
      setEmailMessage({type: 'error', text: 'An error occurred'})
    } finally {
      setEmailLoading(false)
    }
  }

  const handleDeleteEmail = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email address?')) return

    try {
      const response = await fetch('/api/user/delete-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailMessage({type: 'success', text: 'Email deleted successfully'})
        fetchEmails()
      } else {
        setEmailMessage({type: 'error', text: data.error || 'Failed to delete email'})
      }
    } catch (error) {
      setEmailMessage({type: 'error', text: 'An error occurred'})
    }
  }

  const handleSetPrimaryEmail = async (emailId: string) => {
    try {
      const response = await fetch('/api/user/set-primary-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailMessage({type: 'success', text: 'Primary email updated'})
        fetchEmails()
      } else {
        setEmailMessage({type: 'error', text: data.error || 'Failed to set primary email'})
      }
    } catch (error) {
      setEmailMessage({type: 'error', text: 'An error occurred'})
    }
  }

  const generateAnonymousUsername = async () => {
    setUsernameMessage(null)
    setUsernameLoading(true)

    try {
      const response = await fetch('/api/user/generate-username', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setUsername(data.username)
        setUser({ ...user, username: data.username })
        setUsernameMessage({type: 'success', text: 'Anonymous username generated!'})
      } else {
        setUsernameMessage({type: 'error', text: data.error || 'Failed to generate username'})
      }
    } catch (error) {
      setUsernameMessage({type: 'error', text: 'An error occurred'})
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameMessage(null)
    setUsernameLoading(true)

    try {
      const response = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user, username })
        setUsernameMessage({type: 'success', text: 'Username updated successfully!'})
      } else {
        setUsernameMessage({type: 'error', text: data.error || 'Failed to update username'})
      }
    } catch (error) {
      setUsernameMessage({type: 'error', text: 'An error occurred'})
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMessage(null)
    setProfileLoading(true)

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName })
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user, full_name: fullName })
        setProfileMessage({type: 'success', text: 'Profile updated successfully!'})
        setIsEditingProfile(false)
      } else {
        setProfileMessage({type: 'error', text: data.error || 'Failed to update profile'})
      }
    } catch (error) {
      setProfileMessage({type: 'error', text: 'An error occurred'})
    } finally {
      setProfileLoading(false)
    }
  }

  const handleWebsiteUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setWebsiteMessage(null)
    setWebsiteLoading(true)

    try {
      const response = await fetch('/api/user/update-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_url: websiteUrl })
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user, website_url: websiteUrl })
        setWebsiteMessage({type: 'success', text: 'Website URL updated successfully!'})
      } else {
        setWebsiteMessage({type: 'error', text: data.error || 'Failed to update website URL'})
      }
    } catch (error) {
      setWebsiteMessage({type: 'error', text: 'An error occurred'})
    } finally {
      setWebsiteLoading(false)
    }
  }

  const toggleTechStack = (tech: string) => {
    setTechStackPreferences(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  const handleTechStackUpdate = async () => {
    setTechStackMessage(null)
    setTechStackLoading(true)

    try {
      const response = await fetch('/api/user/update-tech-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tech_stack_preferences: techStackPreferences })
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user, tech_stack_preferences: techStackPreferences })
        setTechStackMessage({type: 'success', text: 'Tech stack preferences updated!'})
      } else {
        setTechStackMessage({type: 'error', text: data.error || 'Failed to update preferences'})
      }
    } catch (error) {
      setTechStackMessage({type: 'error', text: 'An error occurred'})
    } finally {
      setTechStackLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your current account details</CardDescription>
              </div>
              {!isEditingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                profileMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <p className="text-sm">{profileMessage.text}</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-base">{user?.email}</p>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false)
                      setFullName(user?.full_name || '')
                      setProfileMessage(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-base">{user?.full_name || 'Not set'}</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="text-base capitalize">{user?.role || 'Client'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Tier</Label>
              <p className="text-base capitalize">{user?.tier || 'Basic'}</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Website Information */}
        <Card>
          <CardHeader>
            <CardTitle>Website Information</CardTitle>
            <CardDescription>
              Add your website URL to track your project and access custom tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWebsiteUpdate} className="space-y-4">
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-website.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the URL of the website you&apos;re building
                </p>
              </div>

              {websiteMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  websiteMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {websiteMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <p className="text-sm">{websiteMessage.text}</p>
                </div>
              )}

              <Button type="submit" disabled={websiteLoading}>
                {websiteLoading ? 'Saving...' : 'Save Website URL'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Anonymous Username */}
        <Card>
          <CardHeader>
            <CardTitle>Anonymous Username</CardTitle>
            <CardDescription>
              Generate or set a username for your interactions throughout the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameUpdate} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter custom username or generate one"
                    pattern="[a-zA-Z0-9_-]{3,50}"
                    title="3-50 characters, letters, numbers, hyphens and underscores only"
                  />
                </div>
                <div className="pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateAnonymousUsername}
                    disabled={usernameLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${usernameLoading ? 'animate-spin' : ''}`} />
                    Generate
                  </Button>
                </div>
              </div>

              {usernameMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  usernameMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {usernameMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <p className="text-sm">{usernameMessage.text}</p>
                </div>
              )}

              <Button type="submit" disabled={usernameLoading || !username}>
                {usernameLoading ? 'Updating...' : 'Update Username'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Tech Stack Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack Preferences</CardTitle>
            <CardDescription>
              Select the technologies you&apos;re using to personalize your resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'nextjs', label: 'Next.js' },
                { id: 'react', label: 'React' },
                { id: 'supabase', label: 'Supabase' },
                { id: 'tailwind', label: 'Tailwind CSS' },
                { id: 'typescript', label: 'TypeScript' },
                { id: 'vercel', label: 'Vercel' },
                { id: 'postgres', label: 'PostgreSQL' },
                { id: 'git', label: 'Git/GitHub' },
                { id: 'nodejs', label: 'Node.js' },
              ].map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTechStack(tech.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    techStackPreferences.includes(tech.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  {tech.label}
                </button>
              ))}
            </div>

            {techStackMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                techStackMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {techStackMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <p className="text-sm">{techStackMessage.text}</p>
              </div>
            )}

            <Button onClick={handleTechStackUpdate} disabled={techStackLoading}>
              {techStackLoading ? 'Saving...' : 'Save Preferences'}
            </Button>

            <p className="text-xs text-muted-foreground">
              Resources will be filtered based on your selected tech stack when you visit the Resources page.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Billing & Payments</CardTitle>
            <CardDescription>
              Manage your payment methods and view invoice history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium mb-1">Stripe Customer Portal</p>
                <p className="text-sm text-muted-foreground">
                  Update payment methods, view billing history, and manage subscriptions
                </p>
              </div>
              <Button
                variant="outline"
                onClick={openCustomerPortal}
                disabled={portalLoading || !user?.stripe_customer_id}
              >
                {portalLoading ? 'Opening...' : 'Manage Billing'}
              </Button>
            </div>

            {!user?.stripe_customer_id && (
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                No billing account found. Make your first purchase to access billing management.
              </div>
            )}

            {/* Invoice History */}
            {invoices.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Recent Invoices</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchInvoices}
                    disabled={invoicesLoading}
                  >
                    {invoicesLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">
                            {invoice.description}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              invoice.status === 'paid'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invoice.created * 1000).toLocaleDateString()} • {invoice.number || 'Invoice'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">
                          ${invoice.amount.toFixed(2)} {invoice.currency}
                        </p>
                        {invoice.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {invoices.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Showing 5 of {invoices.length} invoices. View all in the Customer Portal.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Min 8 characters, 1 uppercase, 1 number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {passwordMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  passwordMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <p className="text-sm">{passwordMessage.text}</p>
                </div>
              )}

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Email Addresses Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Email Addresses</CardTitle>
                <CardDescription>
                  Manage your email addresses. One must be set as primary.
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddEmailDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Email
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {emailMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-md mb-4 ${
                emailMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {emailMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <p className="text-sm">{emailMessage.text}</p>
              </div>
            )}

            <div className="space-y-3">
              {emails.length === 0 ? (
                <p className="text-sm text-muted-foreground">No email addresses found.</p>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{email.email}</span>
                          {email.is_primary && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                          {!email.verified && (
                            <Badge variant="outline" className="text-xs">
                              Unverified
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Added {new Date(email.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!email.is_primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimaryEmail(email.id)}
                        >
                          Set as Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmail(email.id)}
                        disabled={emails.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Email Dialog */}
        <Dialog open={showAddEmailDialog} onOpenChange={setShowAddEmailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Email Address</DialogTitle>
              <DialogDescription>
                Add a new email address to your account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-email">Email Address</Label>
                <Input
                  id="dialog-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="make-primary"
                  checked={makePrimary}
                  onChange={(e) => setMakePrimary(e.target.checked)}
                  className="cursor-pointer"
                />
                <Label htmlFor="make-primary" className="cursor-pointer">
                  Set as primary email
                </Label>
              </div>

              <p className="text-xs text-muted-foreground">
                A verification email will be sent to this address.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddEmailDialog(false)
                setNewEmail('')
                setMakePrimary(false)
                setEmailMessage(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddEmail} disabled={!newEmail || emailLoading}>
                {emailLoading ? 'Adding...' : 'Add Email'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
