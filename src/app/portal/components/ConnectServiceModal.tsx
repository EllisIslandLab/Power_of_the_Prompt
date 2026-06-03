'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ConnectServiceModalProps {
  serviceName: string
  onClose: () => void
  onSuccess: () => void
  userId: string
  existingConnection?: any
}

interface ServiceConfig {
  displayName: string
  supportsOAuth: boolean
  oauthUrl?: (redirectOrigin: string) => string
  fields: {
    name: string
    label: string
    type: 'text' | 'password'
    placeholder: string
    required: boolean
    helpText?: string
  }[]
  docsUrl?: string
  getKeysInstructions?: string
}

const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  github: {
    displayName: 'GitHub',
    supportsOAuth: true,
    oauthUrl: () => '/api/integrations/github/install?redirect_to=/portal/settings',
    fields: [
      {
        name: 'personal_access_token',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'ghp_xxxxxxxxxxxx',
        required: true,
        helpText: 'Need repo, workflow, and admin:repo_hook scopes'
      }
    ],
    docsUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token',
    getKeysInstructions: 'Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token'
  },
  vercel: {
    displayName: 'Vercel',
    supportsOAuth: true,
    oauthUrl: () => '/api/integrations/vercel/install?redirect_to=/portal/settings',
    fields: [
      {
        name: 'access_token',
        label: 'Access Token',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxxx',
        required: true
      }
    ],
    docsUrl: 'https://vercel.com/docs/rest-api#creating-an-access-token',
    getKeysInstructions: 'Go to Vercel Settings → Tokens → Create Token'
  },
  stripe: {
    displayName: 'Stripe',
    supportsOAuth: true,
    oauthUrl: () => '/api/integrations/stripe/install?redirect_to=/portal/settings',
    fields: [
      {
        name: 'publishable_key',
        label: 'Publishable Key',
        type: 'text',
        placeholder: 'pk_test_... or pk_live_...',
        required: true,
        helpText: 'Safe to expose in client-side code'
      },
      {
        name: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'sk_test_... or sk_live_...',
        required: true,
        helpText: 'Keep this secret! Never expose in client code'
      },
      {
        name: 'webhook_secret',
        label: 'Webhook Secret',
        type: 'password',
        placeholder: 'whsec_...',
        required: false,
        helpText: 'Optional: For verifying webhook signatures'
      }
    ],
    docsUrl: 'https://stripe.com/docs/keys',
    getKeysInstructions: 'Go to Stripe Dashboard → Developers → API keys'
  },
  supabase: {
    displayName: 'Supabase',
    supportsOAuth: false,
    fields: [
      {
        name: 'project_url',
        label: 'Project URL',
        type: 'text',
        placeholder: 'https://xxxxx.supabase.co',
        required: true
      },
      {
        name: 'anon_key',
        label: 'Anon/Public Key',
        type: 'password',
        placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true,
        helpText: 'Safe to use in browser'
      },
      {
        name: 'service_role_key',
        label: 'Service Role Key',
        type: 'password',
        placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true,
        helpText: 'Keep secret! Bypasses Row Level Security'
      }
    ],
    docsUrl: 'https://supabase.com/docs/guides/api#api-url-and-keys',
    getKeysInstructions: 'Go to Supabase Project → Settings → API'
  },
  airtable: {
    displayName: 'Airtable',
    supportsOAuth: false,
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'keyxxxxxxxxxxxxx',
        required: true
      },
      {
        name: 'base_id',
        label: 'Base ID',
        type: 'text',
        placeholder: 'appxxxxxxxxxxxxx',
        required: false,
        helpText: 'Optional: Default base to use'
      }
    ],
    docsUrl: 'https://support.airtable.com/docs/how-do-i-get-my-api-key',
    getKeysInstructions: 'Go to Airtable Account → Generate API key'
  },
  resend: {
    displayName: 'Resend',
    supportsOAuth: false,
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 're_xxxxxxxxxxxx',
        required: true
      }
    ],
    docsUrl: 'https://resend.com/docs/api-reference/introduction',
    getKeysInstructions: 'Go to Resend Dashboard → API Keys → Create API Key'
  }
}

export default function ConnectServiceModal({
  serviceName,
  onClose,
  onSuccess,
  userId,
  existingConnection
}: ConnectServiceModalProps) {
  const config = SERVICE_CONFIGS[serviceName]
  const [mode, setMode] = useState<'choose' | 'oauth' | 'manual'>(
    config?.supportsOAuth ? 'choose' : 'manual'
  )
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-foreground mb-4">Service Not Configured</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configuration for {serviceName} is not available yet.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const handleOAuthConnect = () => {
    if (config.oauthUrl) {
      window.location.href = config.oauthUrl(window.location.origin)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      for (const field of config.fields) {
        if (field.required && !formData[field.name]) {
          throw new Error(`${field.label} is required`)
        }
      }

      // First, validate the credentials
      setValidating(true)
      const validateResponse = await fetch('/api/integrations/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceName,
          credentials: formData
        })
      })

      const validateData = await validateResponse.json()

      if (!validateResponse.ok || !validateData.valid) {
        throw new Error(validateData.error || 'Invalid credentials')
      }

      setValidating(false)

      // Save credentials
      const saveResponse = await fetch('/api/integrations/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceName,
          credentials: formData,
          userId
        })
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save credentials')
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error connecting service:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
      setValidating(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Connect {config.displayName}
              </h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Mode Selection */}
            {mode === 'choose' && config.supportsOAuth && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose how you'd like to connect {config.displayName}:
                </p>

                {/* OAuth Option */}
                <button
                  onClick={handleOAuthConnect}
                  className="w-full p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Quick Connect (Recommended)</h3>
                      <p className="text-sm text-muted-foreground">
                        Securely authorize with one click. No need to copy API keys.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Manual Option */}
                <button
                  onClick={() => setMode('manual')}
                  className="w-full p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Manual Entry</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter API keys manually. Useful when OAuth isn't available.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Manual Entry Form */}
            {mode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                {/* Instructions */}
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Where to find your {config.displayName} credentials:
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {config.getKeysInstructions}
                  </p>
                  {config.docsUrl && (
                    <a
                      href={config.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View documentation
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Form Fields */}
                {config.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {field.label}
                      {!field.required && <span className="text-muted-foreground ml-1">(Optional)</span>}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                    />
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                    )}
                  </div>
                ))}

                {/* Error Display */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {config.supportsOAuth && (
                    <button
                      type="button"
                      onClick={() => setMode('choose')}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || validating}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-semibold"
                  >
                    {validating ? 'Validating...' : loading ? 'Saving...' : 'Connect'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
