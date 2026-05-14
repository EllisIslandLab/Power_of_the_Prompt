'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface SettingsInterfaceProps {
  user: any
  clientAccount: any
  userSettings: any
  paymentMethods: any[]
  connectedServices: any[]
  authEmail: string
}

type SettingsTab = 'account' | 'billing' | 'connectors' | 'context' | 'preferences'

export default function SettingsInterface({
  user,
  clientAccount,
  userSettings: initialSettings,
  paymentMethods: initialPaymentMethods,
  connectedServices: initialConnectedServices,
  authEmail,
}: SettingsInterfaceProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [settings, setSettings] = useState(
    initialSettings || {
      username_for_claude: user?.full_name?.split(' ')[0] || '',
      profile_icon_url: '',
      chat_font: 'system',
      notification_errors: true,
      notification_deployments: true,
      notification_email: true,
      theme: 'dark',
      claude_context: '',
      claude_instructions: '',
    }
  )
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods)
  const [connectedServices, setConnectedServices] = useState(initialConnectedServices)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Apply theme on mount
  useEffect(() => {
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme)
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings.theme])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

      // Apply theme immediately
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    // This would need to be implemented with proper backend support
    alert('Account deletion must be requested through support')
    setShowDeleteConfirm(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const tabs = [
    { id: 'account' as const, label: 'Account' },
    { id: 'billing' as const, label: 'Billing' },
    { id: 'connectors' as const, label: 'Connectors' },
    { id: 'context' as const, label: 'Context & Instructions' },
    { id: 'preferences' as const, label: 'Preferences' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-primary hover:underline text-sm"
          >
            ← Back to Portal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Account Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    disabled
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Username (What Claude should call you)
                  </label>
                  <input
                    type="text"
                    value={settings.username_for_claude}
                    onChange={e =>
                      setSettings({ ...settings, username_for_claude: e.target.value })
                    }
                    placeholder="e.g., Sarah"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Profile Icon
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.profile_icon_url && (
                      <img
                        src={settings.profile_icon_url}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-border"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm text-foreground"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a profile picture (max 2MB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Chat Font
                  </label>
                  <select
                    value={settings.chat_font}
                    onChange={e => setSettings({ ...settings, chat_font: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="system">System Default</option>
                    <option value="serif">Anthropic Serif</option>
                    <option value="arial">Arial</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notification_errors}
                    onChange={e =>
                      setSettings({ ...settings, notification_errors: e.target.checked })
                    }
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">Error Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Get notified when errors occur
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notification_deployments}
                    onChange={e =>
                      setSettings({ ...settings, notification_deployments: e.target.checked })
                    }
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Deployment Notifications
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Get notified when deployments complete
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notification_email}
                    onChange={e =>
                      setSettings({ ...settings, notification_email: e.target.checked })
                    }
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">Email Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Security</h2>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm"
              >
                Delete Account
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Permanently delete your account and all associated data
              </p>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && (
                <span className="text-foreground font-semibold text-sm">✓ Saved!</span>
              )}
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {clientAccount?.subscription_tier === 'trial' ? 'Trial' :
                     clientAccount?.subscription_tier === 'full' ? 'Full Service' :
                     'Free'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Balance: ${(clientAccount?.account_balance || 0).toFixed(2)}
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  Upgrade Plan
                </button>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h2>

              {paymentMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-4">No payment methods added</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-foreground">
                          {method.payment_type === 'card' &&
                            `${method.card_brand} •••• ${method.card_last4}`}
                          {method.payment_type === 'ach' &&
                            `${method.bank_name} •••• ${method.account_last4}`}
                          {method.payment_type === 'check' && 'Check Payment'}
                        </div>
                        {method.is_default && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <button className="text-destructive hover:text-destructive/80 text-sm">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <button className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm text-foreground">
                  Add Credit Card
                </button>
                <button className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm text-foreground">
                  Add ACH Bank Account
                </button>
                <div className="pt-2 border-t border-border mt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Pay by Check</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Make checks payable to: <strong>Web Launch Academy LLC</strong></p>
                    <p>Mail to:</p>
                    <p className="ml-4">
                      1968 Torrey Park Trl<br />
                      Painesville, OH 44077
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border mt-4">
                  <p className="text-sm font-medium text-foreground mb-2">ACH Details</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Bank: <strong>Huntington Bank</strong></p>
                    <p>Routing Number: <strong>041000153</strong></p>
                    <p>Account Number: <strong>01663471965</strong></p>
                    <p>Business Name: <strong>Web Launch Academy LLC</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connectors */}
        {activeTab === 'connectors' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Connected Services</h2>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground font-medium mb-2">🚀 Coming Soon: Self-Service Setup</p>
                <p className="text-xs text-muted-foreground">
                  Currently, your project connections are managed by your administrator. Self-service configuration will be available soon for advanced users who own their own code and infrastructure.
                </p>
              </div>

              <div className="space-y-3 opacity-50">
                {['github', 'supabase', 'vercel'].map(service => {
                  const connected = connectedServices.find(s => s.service_type === service)
                  return (
                    <div
                      key={service}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-foreground capitalize">
                          {service}
                        </div>
                        {connected?.is_connected && (
                          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                            Connected
                          </span>
                        )}
                      </div>
                      <button
                        disabled
                        className="px-4 py-2 rounded-lg text-sm bg-muted text-muted-foreground cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Context & Instructions */}
        {activeTab === 'context' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Custom Context for Claude
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Provide background information about your business, brand, or projects that Claude should always keep in mind.
              </p>
              <textarea
                value={settings.claude_context}
                onChange={e => setSettings({ ...settings, claude_context: e.target.value })}
                placeholder="e.g., I run a bakery called Sweet Dreams. We focus on organic ingredients..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={6}
              />
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Custom Instructions for Claude
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tell Claude how you'd like it to work - tone, style, level of detail, or specific preferences.
              </p>
              <textarea
                value={settings.claude_instructions}
                onChange={e => setSettings({ ...settings, claude_instructions: e.target.value })}
                placeholder="e.g., Always ask before making changes. Use simple language. Prefer modern design..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={6}
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && (
                <span className="text-foreground font-semibold text-sm">✓ Saved!</span>
              )}
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Theme</h2>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.theme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/60'
                  }`}
                >
                  <div className="w-full h-24 bg-white border border-gray-300 rounded mb-2" />
                  <div className="text-sm font-medium text-foreground">Light</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.theme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/60'
                  }`}
                >
                  <div className="w-full h-24 bg-gray-900 border border-gray-700 rounded mb-2" />
                  <div className="text-sm font-medium text-foreground">Dark</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: 'colorful' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.theme === 'colorful'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/60'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-blue-500 via-white to-yellow-400 rounded mb-2" />
                  <div className="text-sm font-medium text-foreground">WLA Colorful</div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && (
                <span className="text-foreground font-semibold text-sm">✓ Saved!</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Help & Sign Out */}
      <div className="border-t border-border bg-card mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <a
            href="mailto:support@weblaunchacademy.com"
            className="text-sm text-primary hover:underline"
          >
            Get Help
          </a>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Delete Account?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                This action cannot be undone. All your data, conversations, and deployments will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
