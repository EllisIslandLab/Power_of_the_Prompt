'use client'

import { useState, useEffect, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ConnectServiceModal from '../../components/ConnectServiceModal'

type Step = 'welcome' | 'github' | 'select_repo' | 'analyze' | 'connect_services' | 'validate' | 'complete'

interface Repository {
  id: string
  repository_id: number
  repository_name: string
  full_name: string
  owner: string
  private: boolean
  language: string | null
  default_branch: string
  installation_id: number
}

interface DetectedService {
  name: string
  confidence: 'high' | 'medium' | 'low'
  detected: boolean
  requiredCredentials: string[]
  optionalCredentials: string[]
}

interface ProjectAnalysis {
  framework: {
    name: string
    version?: string
    type: string
  }
  services: DetectedService[]
  packageManager: string
  envVarsNeeded: string[]
  recommendations: string[]
}

const STEP_ORDER: Step[] = ['welcome', 'github', 'select_repo', 'analyze', 'connect_services', 'validate', 'complete']

function ConnectProjectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null)
  const [connectedServices, setConnectedServices] = useState<Set<string>>(new Set())
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({})
  const [connectingService, setConnectingService] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check for existing installations on mount
  useEffect(() => {
    checkExistingInstallation()
    // Get user ID for service connections
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  // Handle OAuth callbacks and URL params
  useEffect(() => {
    const step = searchParams.get('step')
    const errorParam = searchParams.get('error')
    const installationId = searchParams.get('installation_id')

    console.log('[Project Wizard] URL params:', { step, errorParam, installationId })

    if (errorParam) {
      setError(getErrorMessage(errorParam))
    }

    if (step === 'select_repo' && installationId) {
      console.log('[Project Wizard] Setting step to select_repo and fetching repositories')
      setCurrentStep('select_repo')
      fetchRepositories()
    } else if (step === 'vercel_connected') {
      setConnectedServices(prev => new Set(prev).add('vercel'))
      setError(null)
    } else if (step === 'stripe_connected') {
      setConnectedServices(prev => new Set(prev).add('stripe'))
      setError(null)
    }
  }, [searchParams])

  const checkExistingInstallation = async () => {
    try {
      // First check if user already has a project
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: projects } = await supabase
          .from('client_projects')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)

        // If they have a project, redirect to portal instead of wizard
        if (projects && projects.length > 0) {
          router.push('/portal')
          return
        }
      }

      // Check for GitHub repositories
      const response = await fetch('/api/integrations/github/repositories')
      const data = await response.json()

      console.log('[Project Wizard] Repositories response:', data)

      // If there are installations but no repositories, sync them from GitHub
      if (data.installations && data.installations.length > 0 && (!data.repositories || data.repositories.length === 0)) {
        console.log('[Project Wizard] Installation exists but no repos, syncing from GitHub...')
        const installationId = data.installations[0].installation_id

        try {
          const syncResponse = await fetch('/api/integrations/github/repositories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ installationId })
          })

          const syncData = await syncResponse.json()
          console.log('[Project Wizard] Sync result:', syncData)

          if (syncData.repositories && syncData.repositories.length > 0) {
            setRepositories(syncData.repositories)
            if (!searchParams.get('step')) {
              setCurrentStep('select_repo')
            }
            return
          }
        } catch (syncErr) {
          console.error('[Project Wizard] Failed to sync repositories:', syncErr)
        }
      }

      if (data.repositories && data.repositories.length > 0) {
        // User has repositories, skip to select_repo step
        setRepositories(data.repositories)
        if (!searchParams.get('step')) {
          setCurrentStep('select_repo')
        }
      }
    } catch (err) {
      console.error('Failed to check existing installation:', err)
    }
  }

  const fetchRepositories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/integrations/github/repositories')
      const data = await response.json()
      setRepositories(data.repositories || [])
    } catch (err) {
      setError('Failed to fetch repositories')
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
      session_expired: 'Your session expired. Please sign in again.',
      installation_failed: 'Failed to install GitHub App. Please try again.',
      vercel_oauth_failed: 'Failed to connect Vercel. Please try again.',
      stripe_oauth_failed: 'Failed to connect Stripe. Please try again.',
    }
    return messages[errorCode] || 'An error occurred. Please try again.'
  }

  const handleGitHubInstall = () => {
    window.location.href = '/api/integrations/github/install'
  }

  const handleSelectRepo = async (repo: Repository) => {
    setSelectedRepo(repo)
    setCurrentStep('analyze')
    setLoading(true)

    try {
      const response = await fetch('/api/integrations/detect-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryId: repo.id })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setAnalysis(data.analysis)

      // Auto-advance to service connection after a moment
      setTimeout(() => {
        setCurrentStep('connect_services')
      }, 2000)
    } catch (err) {
      setError('Failed to analyze repository')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectService = (serviceName: string) => {
    // Open the unified ConnectServiceModal for all services
    setConnectingService(serviceName)
  }


  const handleValidateAndFinish = async () => {
    if (!selectedRepo) return

    setCurrentStep('validate')
    setLoading(true)

    try {
      // Create project in database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: project, error: projectError } = await supabase
        .from('client_projects')
        .insert({
          user_id: user.id,
          project_name: selectedRepo.repository_name,
          github_repository_id: selectedRepo.id,
          github_owner: selectedRepo.owner,
          github_repo_name: selectedRepo.repository_name,
          github_default_branch: selectedRepo.default_branch,
          github_installation_id: selectedRepo.installation_id,
          framework: analysis?.framework.type || 'unknown',
          package_manager: analysis?.packageManager || 'npm',
          connection_status: 'connected',
          is_active: true
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Credentials already saved at user level by ConnectServiceModal
      // Validate connections
      const validation: Record<string, boolean> = {}

      for (const service of connectedServices) {
        // TODO: Call validation API for each service
        validation[service] = true
      }

      setValidationResults(validation)

      setTimeout(() => {
        setCurrentStep('complete')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const getStepProgress = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep)
    return ((currentIndex + 1) / STEP_ORDER.length) * 100
  }

  const getServiceIcon = (serviceName: string) => {
    const icons: Record<string, string> = {
      supabase: '🔹',
      stripe: '💳',
      vercel: '▲',
      resend: '📧',
      clerk: '🔐',
      openai: '🤖',
      anthropic: '🧠',
      airtable: '📊',
    }
    return icons[serviceName] || '🔌'
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back to Portal Link */}
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground mb-6 transition-colors"
        >
          ← Back to Portal
        </Link>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {STEP_ORDER.map((step, idx) => (
              <span key={step} className={idx <= STEP_ORDER.indexOf(currentStep) ? 'text-primary font-medium' : ''}>
                {step.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-start gap-3">
            <span className="text-xl"></span>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-destructive hover:text-destructive/80">
              ✕
            </button>
          </div>
        )}

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="bg-card rounded-2xl shadow-lg border-2 border-primary/20 p-8 md:p-12 text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-card-foreground mb-4">
              Connect Your Project
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's connect your GitHub repository and services so I can help you build, test, and deploy changes with confidence.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="p-4 bg-muted rounded-lg border border-border">
                <h3 className="font-semibold text-card-foreground mb-1">GitHub Integration</h3>
                <p className="text-sm text-muted-foreground">Secure access to your repository for creating branches and PRs</p>
              </div>
              <div className="p-4 bg-muted rounded-lg border border-border">
                <h3 className="font-semibold text-card-foreground mb-1">Smart Detection</h3>
                <p className="text-sm text-muted-foreground">Automatically identify frameworks and services you're using</p>
              </div>
              <div className="p-4 bg-muted rounded-lg border border-border">
                <h3 className="font-semibold text-card-foreground mb-1">Safe Deployment</h3>
                <p className="text-sm text-muted-foreground">Test changes in isolation before pushing to production</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('github')}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-hover transition-all shadow-md"
            >
              Get Started →
            </button>
          </div>
        )}

        {/* GitHub Connection Step */}
        {currentStep === 'github' && (
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl"></div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">Connect GitHub</h2>
                <p className="text-muted-foreground">Install our GitHub App to access your repositories</p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-card-foreground mb-2">Why GitHub App?</h3>
              <ul className="text-sm text-foreground space-y-1">
                <li>✓ Fine-grained permissions - only access what's needed</li>
                <li>✓ Works with organizations and teams</li>
                <li>✓ Automatic token refresh for security</li>
                <li>✓ Can create branches and pull requests</li>
              </ul>
            </div>

            <button
              onClick={handleGitHubInstall}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-lg text-lg font-semibold hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {loading ? 'Connecting...' : 'Install GitHub App'}
            </button>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              You'll be redirected to GitHub to authorize access. We only request repository access - never billing or account settings.
            </p>
          </div>
        )}

        {/* Select Repository Step */}
        {currentStep === 'select_repo' && (
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl"></div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">Select Repository</h2>
                <p className="text-muted-foreground">Choose the repository you want to work on</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading repositories...</p>
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No repositories found. Please install the GitHub App on your repositories.</p>
                <button
                  onClick={handleGitHubInstall}
                  className="text-primary hover:text-blue-700 font-medium"
                >
                  Reinstall GitHub App →
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleSelectRepo(repo)}
                    className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/10 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-card-foreground group-hover:text-primary">
                            {repo.repository_name}
                          </span>
                          {repo.private && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">Private</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{repo.full_name}</p>
                        {repo.language && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-muted text-foreground rounded">{repo.language}</span>
                            <span className="text-xs text-muted-foreground">{repo.default_branch}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analyze Step */}
        {currentStep === 'analyze' && (
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce"></div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Analyzing Your Project</h2>
              <p className="text-muted-foreground mb-8">
                Detecting frameworks, dependencies, and services...
              </p>

              {loading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left p-3 bg-muted rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left p-3 bg-muted rounded-lg animate-pulse" style={{animationDelay: '150ms'}}>
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              )}

              {analysis && !loading && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl"></div>
                      <div className="text-left">
                        <p className="font-semibold text-green-900">
                          {analysis.framework.name} {analysis.framework.version}
                        </p>
                        <p className="text-sm text-green-700">Package Manager: {analysis.packageManager}</p>
                      </div>
                    </div>
                  </div>

                  {analysis.services.length > 0 && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-left">
                      <p className="font-semibold text-card-foreground mb-2">Detected Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.services.map(service => (
                          <span key={service.name} className="px-3 py-1 bg-card border border-blue-300 text-foreground rounded-full text-sm">
                            {getServiceIcon(service.name)} {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connect Services Step */}
        {currentStep === 'connect_services' && analysis && (
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl"></div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">Connect Services</h2>
                <p className="text-muted-foreground">Connect the services your project uses</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {analysis.services.filter(s => s.confidence === 'high').map((service) => {
                const isConnected = connectedServices.has(service.name)

                return (
                  <div
                    key={service.name}
                    className={`p-5 border-2 rounded-lg transition-all ${
                      isConnected
                        ? 'border-green-500 bg-green-50'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getServiceIcon(service.name)}</span>
                        <div>
                          <h3 className="font-semibold text-lg capitalize text-foreground">{service.name}</h3>
                          <p className="text-sm text-foreground/70">
                            {isConnected ? 'Connected ✓' : 'Not connected'}
                          </p>
                        </div>
                      </div>

                      {!isConnected && (
                        <button
                          onClick={() => handleConnectService(service.name)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                        >
                          Connect
                        </button>
                      )}

                      {isConnected && (
                        <div className="text-green-600 font-medium">✓ Connected</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('select_repo')}
                className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleValidateAndFinish}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all font-semibold"
              >
                Continue →
              </button>
            </div>

            <p className="text-xs text-foreground/60 mt-4 text-center">
              You can connect more services later from your project settings
            </p>
          </div>
        )}

        {/* Validate Step */}
        {currentStep === 'validate' && (
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse"></div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Validating Connections</h2>
              <p className="text-foreground/70 mb-8">
                Testing your service connections...
              </p>

              <div className="space-y-3">
                {Array.from(connectedServices).map((service) => {
                  const isValidated = service in validationResults
                  const isValid = validationResults[service]

                  return (
                    <div
                      key={service}
                      className={`flex items-center gap-3 p-4 rounded-lg ${
                        isValidated
                          ? isValid
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      <span className="text-2xl">{getServiceIcon(service)}</span>
                      <span className="flex-1 text-left font-medium capitalize text-foreground">{service}</span>
                      {!isValidated && (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {isValidated && isValid && (
                        <span className="text-green-600">✓</span>
                      )}
                      {isValidated && !isValid && (
                        <span className="text-red-600">✗</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && (
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 text-center animate-fade-in">
            <div className="text-7xl mb-6 animate-bounce"></div>
            <h2 className="text-3xl font-bold text-card-foreground mb-3">All Set!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your project is connected and ready. Let's start building!
            </p>

            {selectedRepo && (
              <div className="bg-muted rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-card-foreground mb-3">Connected:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl"></span>
                    <span className="font-mono text-sm">{selectedRepo.full_name}</span>
                  </div>
                  {analysis && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl"></span>
                      <span className="text-sm">{analysis.framework.name}</span>
                    </div>
                  )}
                  {connectedServices.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl"></span>
                      <span className="text-sm">{connectedServices.size} service{connectedServices.size !== 1 ? 's' : ''} connected</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <a
              href="/portal"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold hover:bg-primary-hover transition-all transform hover:scale-105 shadow-lg"
            >
              Start Building →
            </a>
          </div>
        )}
      </div>

      {/* Unified Service Connection Modal */}
      {connectingService && userId && (
        <ConnectServiceModal
          serviceName={connectingService}
          onClose={() => setConnectingService(null)}
          onSuccess={() => {
            // Mark service as connected (credentials saved at user level)
            setConnectedServices(prev => new Set(prev).add(connectingService))
            setConnectingService(null)
          }}
          userId={userId}
        />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function ConnectProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConnectProjectContent />
    </Suspense>
  )
}
