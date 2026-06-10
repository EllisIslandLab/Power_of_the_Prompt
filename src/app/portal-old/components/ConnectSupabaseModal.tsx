'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ConnectSupabaseModalProps {
  onClose: () => void
  onSuccess: () => void
  userId: string
  projectId?: string
}

export default function ConnectSupabaseModal({
  onClose,
  onSuccess,
  userId,
  projectId,
}: ConnectSupabaseModalProps) {
  const [projectUrl, setProjectUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [serviceRoleKey, setServiceRoleKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const validateAndConnect = async () => {
    setError(null)
    setIsValidating(true)

    try {
      // Validate URL format
      if (!projectUrl.includes('supabase.co')) {
        throw new Error('Invalid Supabase project URL. Should be like: https://yourproject.supabase.co')
      }

      // Test the credentials by trying to connect
      const { createClient } = await import('@supabase/supabase-js')
      const testClient = createClient(projectUrl, anonKey)

      // Try a simple query to verify connection
      const { error: testError } = await testClient.from('_migrations').select('id').limit(1)

      // Note: We expect an error if _migrations doesn't exist, but connection should work
      if (testError && !testError.message.includes('does not exist') && !testError.message.includes('permission')) {
        throw new Error(`Connection failed: ${testError.message}`)
      }

      // Save credentials to database
      const response = await fetch('/api/portal/connect-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'supabase',
          projectId,
          credentials: {
            project_url: projectUrl,
            anon_key: anonKey,
            service_role_key: serviceRoleKey,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save credentials')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full">
          {/* Header */}
          <div className="border-b border-border p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Connect Supabase Project</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your Supabase project credentials to enable database management
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-foreground font-medium mb-2">📍 Where to find these:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to your Supabase project dashboard</li>
                <li>Click Settings → API</li>
                <li>Copy Project URL and keys</li>
              </ol>
            </div>

            {/* Project URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project URL <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://yourproject.supabase.co"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Anon Key */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Anon (Public) Key <span className="text-destructive">*</span>
              </label>
              <textarea
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for client-side database access
              </p>
            </div>

            {/* Service Role Key */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Service Role Key <span className="text-destructive">*</span>
              </label>
              <textarea
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used by Claude to manage your database schema (bypasses RLS)
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Security Note */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                🔒 <strong>Security:</strong> Your keys are encrypted and stored securely. They're only used to help Claude manage your database and are never shared with third parties.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={validateAndConnect}
              disabled={!projectUrl || !anonKey || !serviceRoleKey || isValidating}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                'Connect Supabase'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
