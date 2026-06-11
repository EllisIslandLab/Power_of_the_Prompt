'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ConnectorsTabProps {
  user: any
  connectedServices: any[]
  setConnectedServices: (services: any[]) => void
  setConnectingService: (service: string | null) => void
  showRepoSelector: boolean
  setShowRepoSelector: (show: boolean) => void
  availableRepos: any[]
  isLinkingRepo: boolean
  handleLinkRepository: (repoId: string) => void
}

interface DetectedService {
  name: string
  detected: boolean
  configured: boolean
  confidence: 'high' | 'medium' | 'low'
  requiredVars: string[]
  optionalVars: string[]
  detectedVars: string[]
  missingVars: string[]
}

export default function ConnectorsTab({
  user,
  connectedServices,
  setConnectedServices,
  setConnectingService,
  showRepoSelector,
  setShowRepoSelector,
  availableRepos,
  isLinkingRepo,
  handleLinkRepository
}: ConnectorsTabProps) {
  const [detectedServices, setDetectedServices] = useState<DetectedService[]>([])
  const [isDetectingServices, setIsDetectingServices] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Detect services from Vercel on mount
  useEffect(() => {
    detectServicesFromVercel()
  }, [])

  const detectServicesFromVercel = async () => {
    setIsDetectingServices(true)
    try {
      const response = await fetch('/api/integrations/vercel/detect-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[Connectors] Detected services:', data.services)
        setDetectedServices(data.services || [])
      } else {
        // Vercel not connected or no project - that's OK
        console.log('[Connectors] Could not detect services (Vercel not connected yet)')
      }
    } catch (error) {
      console.error('[Connectors] Failed to detect services:', error)
    } finally {
      setIsDetectingServices(false)
    }
  }

  const handleReconnectVercel = async () => {
    // Reconnect Vercel and trigger service detection
    const confirmed = confirm(
      'Reconnect Vercel to detect new services from your environment variables.\n\n' +
      'This will:\n' +
      '1. Refresh your Vercel connection\n' +
      '2. Detect services from env vars (Stripe, Supabase, Airtable, etc.)\n' +
      '3. Allow Claude Code to use detected services\n\n' +
      'Continue?'
    )

    if (!confirmed) return

    // Trigger Vercel reconnect
    setConnectingService('vercel')
  }

  const githubConnected = connectedServices.find(s => s.service_name === 'github')
  const vercelConnected = connectedServices.find(s => s.service_name === 'vercel')

  // Get service display info
  const getServiceInfo = (serviceName: string) => {
    const info: Record<string, { icon: string, description: string }> = {
      supabase: { icon: '🗄️', description: 'Database & authentication' },
      stripe: { icon: '💳', description: 'Payments & subscriptions' },
      airtable: { icon: '📊', description: 'Databases & spreadsheets' },
      resend: { icon: '📧', description: 'Transactional email' },
      clerk: { icon: '🔐', description: 'Authentication' },
      openai: { icon: '🤖', description: 'AI & language models' },
      anthropic: { icon: '🧠', description: 'Claude AI API' },
      sendgrid: { icon: '✉️', description: 'Email delivery' },
      twilio: { icon: '📱', description: 'SMS & phone' },
      google: { icon: '🔍', description: 'Google services' }
    }
    return info[serviceName] || { icon: '🔌', description: 'Service integration' }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Connected Services</h2>

        <p className="text-sm text-muted-foreground mb-4">
          Connect GitHub and Vercel, then services are automatically detected from your Vercel environment variables.
        </p>

        {/* Repository Selector Banner */}
        {showRepoSelector && availableRepos.length > 0 && (
          <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔗</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-2">Select Repository to Link</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  GitHub reconnected successfully! Select which repository to link to your project:
                </p>
                <div className="space-y-2">
                  {availableRepos.map(repo => (
                    <button
                      key={repo.id}
                      onClick={() => handleLinkRepository(repo.id)}
                      disabled={isLinkingRepo}
                      className="w-full text-left px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-foreground">{repo.full_name}</div>
                          {repo.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">{repo.description}</div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {repo.private ? '🔒 Private' : '🌐 Public'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {isLinkingRepo && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Linking repository...
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowRepoSelector(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Core Services - OAuth Based */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Core Services</h3>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg mb-3">
              <div className="flex items-center gap-3">
                <div className="text-xl">🐙</div>
                <div>
                  <div className="text-sm font-medium text-foreground">GitHub</div>
                  <div className="text-xs text-muted-foreground">Source control & repositories</div>
                </div>
                {githubConnected?.is_connected && (
                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                    Connected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {githubConnected ? (
                  <>
                    <button
                      onClick={() => {
                        if (confirm('Reconnect GitHub?\n\nThis will refresh your repository access.')) {
                          fetch('/api/integrations/github/disconnect', { method: 'POST' })
                            .then(() => {
                              alert('✓ Cleared! Redirecting to GitHub...')
                              setTimeout(() => {
                                const returnUrl = `${window.location.origin}/portal/settings?tab=connectors`
                                window.location.href = `/api/integrations/github/install?redirect_to=${encodeURIComponent(returnUrl)}`
                              }, 1000)
                            })
                            .catch(() => alert('Error reconnecting. Try manually via GitHub settings.'))
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Reconnect
                    </button>
                    <button
                      onClick={() => window.open('https://github.com/settings/installations', '_blank')}
                      className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted/50 transition-colors"
                    >
                      Manage →
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConnectingService('github')}
                    className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Vercel */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-xl">▲</div>
                <div>
                  <div className="text-sm font-medium text-foreground">Vercel</div>
                  <div className="text-xs text-muted-foreground">Deployment & environment variables</div>
                </div>
                {vercelConnected?.is_connected && (
                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                    Connected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {vercelConnected ? (
                  <>
                    <button
                      onClick={handleReconnectVercel}
                      disabled={isDetectingServices}
                      className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isDetectingServices ? 'Detecting...' : 'Reconnect & Detect Services'}
                    </button>
                    <button
                      onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
                      className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted/50 transition-colors"
                    >
                      Manage →
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConnectingService('vercel')}
                    className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Auto-Detected Services */}
          {detectedServices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Detected Services from Vercel
                </h3>
                <button
                  onClick={detectServicesFromVercel}
                  disabled={isDetectingServices}
                  className="text-xs text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  {isDetectingServices ? '🔄 Detecting...' : '🔄 Refresh'}
                </button>
              </div>

              <div className="space-y-2">
                {detectedServices.map(service => {
                  const info = getServiceInfo(service.name)
                  return (
                    <div key={service.name} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{info.icon}</div>
                        <div>
                          <div className="text-sm font-medium text-foreground capitalize">{service.name}</div>
                          <div className="text-xs text-muted-foreground">{info.description}</div>
                        </div>
                        {service.configured ? (
                          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                            ✅ Configured
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                            ⚠️ Incomplete
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {service.configured ? (
                          <div className="text-xs text-muted-foreground">
                            {service.detectedVars.length} env var{service.detectedVars.length !== 1 ? 's' : ''} found
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            Missing: {service.missingVars.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Services Detected */}
          {!isDetectingServices && vercelConnected && detectedServices.length === 0 && (
            <div className="mt-6 p-4 border border-border/50 rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">
                <strong>No services detected yet.</strong>
                <br />
                Add environment variables to your Vercel project (like STRIPE_SECRET_KEY, SUPABASE_URL, etc.),
                then click "Reconnect & Detect Services" to have them appear here automatically.
              </p>
            </div>
          )}

          {/* Vercel Not Connected */}
          {!vercelConnected && (
            <div className="mt-6 p-4 border border-blue-500/50 rounded-lg bg-blue-500/10">
              <p className="text-sm text-foreground">
                <strong>📡 Connect Vercel to auto-detect services</strong>
                <br />
                <span className="text-muted-foreground">
                  Once Vercel is connected, services like Stripe, Supabase, and Airtable will be automatically
                  detected from your environment variables.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
