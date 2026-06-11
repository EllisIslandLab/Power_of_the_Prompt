'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { loadStripe } from '@stripe/stripe-js'
import ConnectServiceModal from '../components/ConnectServiceModal'
import ConnectorsTab from './ConnectorsTab'
import AccountLinking from './AccountLinking'
import AdminOnboardingReset from './AdminOnboardingReset'
import { isAdmin } from '@/lib/admin-utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SettingsInterfaceProps {
  user: any
  clientAccount: any
  userSettings: any
  paymentMethods: any[]
  connectedServices: any[]
  conversations: any[]
  authEmail: string
  initialTab: 'account' | 'billing' | 'connectors' | 'context' | 'preferences'
}

type SettingsTab = 'account' | 'billing' | 'connectors' | 'context' | 'preferences'

export default function SettingsInterface({
  user,
  clientAccount,
  userSettings: initialSettings,
  paymentMethods: initialPaymentMethods,
  connectedServices: initialConnectedServices,
  conversations,
  authEmail,
  initialTab,
}: SettingsInterfaceProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)
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
  const [connectingService, setConnectingService] = useState<string | null>(null)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Billing state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isAddingFunds, setIsAddingFunds] = useState(false)

  // Repository selection state
  const [showRepoSelector, setShowRepoSelector] = useState(false)
  const [availableRepos, setAvailableRepos] = useState<any[]>([])

  // Admin check
  const userIsAdmin = isAdmin(authEmail)
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null)
  const [isLinkingRepo, setIsLinkingRepo] = useState(false)
  const [installationIdForRepoSelect, setInstallationIdForRepoSelect] = useState<string | null>(null)

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

  // Check for repo selection query param (from GitHub callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const selectRepo = params.get('select_repo')
    const installationId = params.get('installation_id')
    const vercelConnected = params.get('step') === 'vercel_connected'

    if (selectRepo === 'true' && installationId) {
      setInstallationIdForRepoSelect(installationId)
      setActiveTab('connectors')

      // Fetch available repositories
      fetch(`/api/integrations/github/repositories?installation_id=${installationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.repositories) {
            setAvailableRepos(data.repositories)
            setShowRepoSelector(true)
          }
        })
        .catch(err => {
          console.error('Failed to fetch repositories:', err)
        })
    }

    // Auto-sync env vars when Vercel connects (Vercel-first approach)
    if (vercelConnected) {
      setActiveTab('connectors')

      // Trigger env sync automatically
      syncVercelEnvVars()
    }
  }, [])

  const syncVercelEnvVars = async () => {
    try {
      console.log('[Settings] Syncing env vars from Vercel...')

      // Get Vercel credentials
      const { data: vercelCreds } = await supabase
        .from('client_service_credentials')
        .select('access_token_encrypted, metadata')
        .eq('user_id', user.id)
        .eq('service_name', 'vercel')
        .single()

      if (!vercelCreds) {
        console.log('[Settings] No Vercel credentials found')
        return
      }

      // Get active project with Vercel project ID
      const { data: project } = await supabase
        .from('client_projects')
        .select('id, vercel_project_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!project?.vercel_project_id) {
        console.log('[Settings] No Vercel project linked yet - will sync after first deployment')
        return
      }

      // Decrypt token (we'll need to call the API with encrypted token, API will decrypt)
      const response = await fetch('/api/integrations/vercel/sync-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.vercel_project_id,
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[Settings] ✓ Synced env vars:', data.connected_services)

        // Refresh connected services to show new connections
        const servicesRes = await fetch('/api/portal/services')
        const servicesData = await servicesRes.json()
        setConnectedServices(servicesData.services || [])

        // Show success notification
        alert(`✓ Connected ${data.connected_services.length} services from Vercel:\n${data.connected_services.join(', ')}`)
      } else {
        console.log('[Settings] Env sync will happen after first deployment')
      }
    } catch (error) {
      console.error('[Settings] Failed to sync env vars:', error)
      // Don't show error to user - this will happen automatically via webhook
    }
  }

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

  const handleAddFunds = async () => {
    const amount = selectedAmount || parseFloat(customAmount)
    if (!amount || amount < 1) {
      alert('Please select or enter an amount of at least $1')
      return
    }

    if (!clientAccount?.id) {
      alert('Unable to process payment. Please contact support.')
      return
    }

    setIsAddingFunds(true)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/portal/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          clientAccountId: clientAccount.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe checkout
      const stripe = await stripePromise
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId })

      if (stripeError) {
        console.error('Stripe error:', stripeError)
        alert('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setIsAddingFunds(false)
    }
  }

  const presetAmounts = [5, 10, 20, 50]

  const tabs = [
    { id: 'account' as const, label: 'Account' },
    { id: 'billing' as const, label: 'Billing' },
    { id: 'connectors' as const, label: 'Connectors' },
    { id: 'context' as const, label: 'Context & Instructions' },
    { id: 'preferences' as const, label: 'Preferences' },
  ]

  const handleLinkRepository = async (repoId: string) => {
    if (!installationIdForRepoSelect) return

    setIsLinkingRepo(true)
    try {
      const repo = availableRepos.find(r => r.id === repoId)
      if (!repo) {
        throw new Error('Repository not found')
      }

      const response = await fetch('/api/portal/link-repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installation_id: installationIdForRepoSelect,
          repository_id: repo.repository_id,
          repository_name: repo.repository_name,
          owner: repo.owner,
          default_branch: repo.default_branch
        })
      })

      if (!response.ok) {
        throw new Error('Failed to link repository')
      }

      // Success! Hide selector and reload services
      setShowRepoSelector(false)
      setIsLoadingServices(true)

      // Refresh connected services
      const servicesRes = await fetch('/api/portal/services')
      const servicesData = await servicesRes.json()
      setConnectedServices(servicesData.services || [])
      setIsLoadingServices(false)

      // Clear query params
      window.history.replaceState({}, '', '/portal/settings')

      alert('✓ Repository linked successfully!')
    } catch (error: any) {
      console.error('Failed to link repository:', error)
      alert(`Failed to link repository: ${error.message}`)
    } finally {
      setIsLinkingRepo(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050714]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#080c25]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Settings</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-[#b1c6f9] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ← Back to Portal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-[#080c25]/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FFB800] text-[#FFB800]'
                    : 'border-transparent text-[#c4c7c8] hover:text-white'
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
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Account Info & Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Information */}
              <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Account Info</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={authEmail}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-white/10 rounded bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                    <input
                      type="text"
                      value={user?.full_name || ''}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-white/10 rounded bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Username (for Claude)
                    </label>
                    <input
                      type="text"
                      value={settings.username_for_claude}
                      onChange={e =>
                        setSettings({ ...settings, username_for_claude: e.target.value })
                      }
                      placeholder="e.g., Sarah, John"
                      className="w-full px-3 py-2 text-sm border border-white/10 rounded bg-card/50 text-foreground focus:outline-none focus:border-primary/50"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      How Claude addresses you
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Email Notifications</p>
                <div className="space-y-2.5">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notification_errors}
                      onChange={e =>
                        setSettings({ ...settings, notification_errors: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-primary border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">System Errors</div>
                      <div className="text-[10px] text-muted-foreground">
                        Errors & deployment failures
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notification_deployments}
                      onChange={e =>
                        setSettings({ ...settings, notification_deployments: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-primary border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">Deployments</div>
                      <div className="text-[10px] text-muted-foreground">
                        Successful production deploys
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notification_email}
                      onChange={e =>
                        setSettings({ ...settings, notification_email: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-primary border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">Product Updates</div>
                      <div className="text-[10px] text-muted-foreground">
                        New features & tips
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Linking */}
            <AccountLinking user={user} />

            {/* Admin Onboarding Reset */}
            <AdminOnboardingReset user={user} isAdmin={userIsAdmin} />

            {/* Security & Actions */}
            <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Danger Zone</p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-1.5 bg-destructive/80 text-destructive-foreground rounded hover:bg-destructive transition-colors text-xs font-medium"
                  >
                    Delete Account
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {saved && (
                    <span className="text-green-400 font-semibold text-xs">✓ Saved!</span>
                  )}
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 disabled:opacity-50 transition-all text-sm shadow-lg shadow-primary/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === 'billing' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Balance & Quick Add - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Balance Card */}
              <div className="md:col-span-1 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Balance</p>
                <p className={`text-4xl font-bold mb-0.5 relative z-10 ${
                  (clientAccount?.account_balance || 0) === 0
                    ? 'text-red-400'
                    : (clientAccount?.account_balance || 0) < 10
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}
                style={{
                  textShadow: (clientAccount?.account_balance || 0) >= 10
                    ? '0 0 20px rgba(74, 222, 128, 0.3), 0 0 40px rgba(74, 222, 128, 0.1)'
                    : (clientAccount?.account_balance || 0) < 10 && (clientAccount?.account_balance || 0) > 0
                    ? '0 0 20px rgba(250, 204, 21, 0.3)'
                    : '0 0 20px rgba(248, 113, 113, 0.3)'
                }}>
                  ${clientAccount?.account_balance?.toFixed(2) || '0.00'}
                </p>
                <p className="text-[10px] text-muted-foreground">AI chat · Help · Services</p>
              </div>

              {/* Quick Add Funds */}
              <div className="md:col-span-2 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Quick Add</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {presetAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount('')
                      }}
                      className={`py-2 px-3 rounded border transition-all text-sm font-semibold ${
                        selectedAmount === amount
                          ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                          : 'border-white/10 bg-white/5 text-foreground hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={e => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    placeholder="Custom amount"
                    className="flex-1 px-3 py-2 text-sm border border-white/10 rounded bg-card/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={handleAddFunds}
                    disabled={isAddingFunds || (!selectedAmount && !customAmount)}
                    className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-primary/20"
                  >
                    {isAddingFunds ? 'Processing...' : 'Add Funds'}
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing & Payment Info - Middle Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pricing */}
              <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Pricing Guide</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Chat:</span>
                    <span className="text-foreground font-medium">$0.03/1K tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Small change:</span>
                    <span className="text-foreground font-medium">~$0.50-$1.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medium change:</span>
                    <span className="text-foreground font-medium">~$2.00-$5.00</span>
                  </div>
                </div>
              </div>

              {/* Alternative Payment */}
              <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Alternative Payment</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Pay by Check</p>
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      <p>Web Launch Academy LLC</p>
                      <p>1968 Torrey Park Trl, Painesville, OH 44077</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs font-medium text-foreground mb-1">ACH Transfer</p>
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      <p>Huntington Bank · Routing: 041000153</p>
                      <p>Account: 01663471965</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History - Bottom */}
            <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Recent Activity</p>
                <p className="text-[10px] text-muted-foreground">
                  {conversations.length > 0 ? `${conversations.length} conversation${conversations.length === 1 ? '' : 's'}` : 'AI chat history'}
                </p>
              </div>

              {!conversations || conversations.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-xs">No conversations yet</p>
                  <p className="text-muted-foreground text-[10px] mt-1">Start chatting with Claude to see activity here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto panel-scroll">
                  {conversations.slice(0, 10).map(conv => {
                    const messages = conv.revision_chat_messages || []
                    const convCost = messages.reduce(
                      (sum: number, msg: any) => {
                        const tokens = msg.tokens_used || 0
                        return sum + (tokens / 1000) * 0.03
                      },
                      0
                    )

                    return (
                      <div
                        key={conv.id}
                        className="flex justify-between items-center py-1.5 px-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {new Date(conv.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {messages.length} message{messages.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-foreground">
                            ${convCost.toFixed(4)}
                          </p>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {conv.status || 'active'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Connectors */}
        {activeTab === 'connectors' && (
          <ConnectorsTab
            user={user}
            connectedServices={connectedServices}
            setConnectedServices={setConnectedServices}
            setConnectingService={setConnectingService}
            showRepoSelector={showRepoSelector}
            setShowRepoSelector={setShowRepoSelector}
            availableRepos={availableRepos}
            isLinkingRepo={isLinkingRepo}
            handleLinkRepository={handleLinkRepository}
          />
        )}
        {/* Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Theme Selection */}
            <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Visual Theme</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                  className={`p-3 border rounded transition-all ${
                    settings.theme === 'light'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-primary/30'
                  }`}
                >
                  <div className="w-full h-16 bg-white border border-gray-300 rounded mb-2" />
                  <div className="text-xs font-medium text-foreground">Light</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  className={`p-3 border rounded transition-all ${
                    settings.theme === 'dark'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-primary/30'
                  }`}
                >
                  <div className="w-full h-16 bg-gray-900 border border-gray-700 rounded mb-2" />
                  <div className="text-xs font-medium text-foreground">Dark</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: 'colorful' })}
                  className={`p-3 border rounded transition-all ${
                    settings.theme === 'colorful'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-primary/30'
                  }`}
                >
                  <div className="w-full h-16 bg-gradient-to-br from-blue-500 via-white to-yellow-400 rounded mb-2" />
                  <div className="text-xs font-medium text-foreground">Colorful</div>
                </button>
              </div>
            </div>

            {/* Behavior & Editor - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Portal Behavior */}
              <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Portal Behavior</p>
                <div className="space-y-2.5">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_save_enabled !== false}
                      onChange={e =>
                        setSettings({ ...settings, auto_save_enabled: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-primary border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">Auto-save settings</div>
                      <div className="text-[10px] text-muted-foreground">
                        Save preferences automatically
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_file_tree !== false}
                      onChange={e =>
                        setSettings({ ...settings, show_file_tree: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-primary border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">Expand file tree</div>
                      <div className="text-[10px] text-muted-foreground">
                        Show file explorer by default
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_keyboard_shortcuts !== false}
                      onChange={e =>
                        setSettings({ ...settings, enable_keyboard_shortcuts: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-primary border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">Keyboard shortcuts</div>
                      <div className="text-[10px] text-muted-foreground">
                        Enable Cmd+K and other shortcuts
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Code Editor */}
              <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur rounded-lg border border-white/10 p-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Code Editor</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Font Size
                    </label>
                    <select
                      value={settings.editor_font_size || 'medium'}
                      onChange={e => setSettings({ ...settings, editor_font_size: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-white/10 rounded bg-card/50 text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="small">Small (12px)</option>
                      <option value="medium">Medium (14px)</option>
                      <option value="large">Large (16px)</option>
                    </select>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_line_numbers !== false}
                      onChange={e =>
                        setSettings({ ...settings, show_line_numbers: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-primary border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">Show line numbers</div>
                      <div className="text-[10px] text-muted-foreground">
                        Display line numbers in code
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3">
              {saved && (
                <span className="text-green-400 font-semibold text-xs">✓ Saved!</span>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 disabled:opacity-50 transition-all text-sm shadow-lg shadow-primary/20"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help & Sign Out */}
      <div className="border-t border-border bg-card mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <a
            href="/support"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Support Center
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

      {/* Service Connection Modal */}
      {connectingService && (
        <ConnectServiceModal
          serviceName={connectingService}
          onClose={() => setConnectingService(null)}
          onSuccess={() => {
            setConnectingService(null)
            // Refresh connected services
            window.location.reload()
          }}
          userId={user.id}
        />
      )}
    </div>
  )
}
