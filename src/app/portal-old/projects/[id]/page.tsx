'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { use } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  project_name: string
  github_owner: string
  github_repo_name: string
  github_default_branch: string
  framework: string
  package_manager: string
  connection_status: string
  created_at: string
}

interface ServiceCredential {
  service_name: string
  is_valid: boolean
  last_validated_at: string | null
  metadata: any
}

export default function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [services, setServices] = useState<ServiceCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchProject()
    fetchServices()
  }, [id])

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('client_projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/integrations/validate')
      const data = await response.json()
      setServices(data.credentials || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const handleValidateAll = async () => {
    setValidating(true)
    try {
      const serviceNames = services.map(s => s.service_name)
      const response = await fetch('/api/integrations/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: serviceNames })
      })

      const data = await response.json()

      // Update services with validation results
      setServices(prev =>
        prev.map(service => {
          const result = data.results?.find((r: any) => r.service === service.service_name)
          return result
            ? { ...service, is_valid: result.valid, last_validated_at: new Date().toISOString() }
            : service
        })
      )
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setValidating(false)
    }
  }

  const getServiceIcon = (serviceName: string) => {
    const icons: Record<string, string> = {
      supabase: '🗄️',
      stripe: '💳',
      vercel: '▲',
      resend: '📧',
      clerk: '🔐',
      openai: '🤖',
      anthropic: '🧠',
      github: '📂',
    }
    return icons[serviceName] || '🔌'
  }

  const getStatusColor = (isValid: boolean) => {
    return isValid
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">This project doesn't exist or you don't have access.</p>
          <Link href="/portal" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Portal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portal" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Portal
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.project_name}</h1>
              <p className="text-gray-600">
                {project.github_owner}/{project.github_repo_name}
              </p>
            </div>
            <button
              onClick={handleValidateAll}
              disabled={validating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {validating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Validating...
                </>
              ) : (
                <>
                  ⚡ Test All Connections
                </>
              )}
            </button>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-500 text-sm mb-1">Framework</div>
            <div className="text-2xl font-bold text-gray-900 capitalize">{project.framework}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-500 text-sm mb-1">Package Manager</div>
            <div className="text-2xl font-bold text-gray-900">{project.package_manager}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-500 text-sm mb-1">Default Branch</div>
            <div className="text-2xl font-bold text-gray-900">{project.github_default_branch}</div>
          </div>
        </div>

        {/* Connected Services */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Connected Services</h2>
            <Link
              href={`/portal/projects/${id}/settings`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Manage Connections →
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔌</div>
              <p className="text-gray-600 mb-4">No services connected yet</p>
              <Link
                href={`/portal/projects/${id}/settings`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Services
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.service_name}
                  className={`p-5 border-2 rounded-lg ${
                    service.is_valid
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getServiceIcon(service.service_name)}</span>
                      <div>
                        <h3 className="font-semibold text-lg capitalize">{service.service_name}</h3>
                        <p className="text-sm text-gray-600">
                          Last checked: {formatDate(service.last_validated_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        service.is_valid
                      )}`}
                    >
                      {service.is_valid ? '✓ Active' : '✗ Error'}
                    </span>
                  </div>

                  {service.metadata && Object.keys(service.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer font-medium">Connection Details</summary>
                        <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                          {JSON.stringify(service.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href={`https://github.com/${project.github_owner}/${project.github_repo_name}`}
              target="_blank"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-2xl mb-2">📂</div>
              <h3 className="font-semibold mb-1 group-hover:text-blue-600">View on GitHub</h3>
              <p className="text-sm text-gray-600">Open repository</p>
            </Link>

            <Link
              href={`/portal/projects/${id}/settings`}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold mb-1 group-hover:text-blue-600">Project Settings</h3>
              <p className="text-sm text-gray-600">Manage connections</p>
            </Link>

            <Link
              href="/portal"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold mb-1 group-hover:text-blue-600">Start Chat</h3>
              <p className="text-sm text-gray-600">Build with AI</p>
            </Link>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to Build</h3>
              <p className="text-blue-100 text-sm">
                All systems connected. Start a conversation to begin building.
              </p>
            </div>
            <Link
              href="/portal"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Open Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
