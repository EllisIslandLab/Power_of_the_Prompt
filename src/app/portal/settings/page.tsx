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

  useEffect(() => {
    fetchUserProfile()
    fetchEmails()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setUsername(data.user.username || '')
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
        {/* Current Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-base">{user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
              <p className="text-base">{user?.full_name || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="text-base capitalize">{user?.role || 'Student'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Tier</Label>
              <p className="text-base capitalize">{user?.tier || 'Basic'}</p>
            </div>
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
