'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface WebsiteSettingsInterfaceProps {
  user: any
  clientAccount: any
  websiteConfig: any
  uploadedImages: any[]
}

export default function WebsiteSettingsInterface({
  user,
  clientAccount,
  websiteConfig: initialConfig,
  uploadedImages,
}: WebsiteSettingsInterfaceProps) {
  const [config, setConfig] = useState(
    initialConfig || {
      website_url: '',
      github_repo_url: '',
      github_branch: 'main',
      vercel_project_name: '',
      vercel_team_slug: '',
      public_folder_path: '/public',
      images_folder_path: '/public/images',
    }
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('client_website_config')
        .upsert({
          client_account_id: clientAccount.id,
          ...config,
          is_configured: !!(config.website_url && config.github_repo_url),
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Website Settings</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-primary hover:underline"
          >
            ← Back to Portal
          </button>
        </div>

        {/* Website Configuration */}
        <div className="bg-card rounded-lg shadow border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Website Configuration
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Configure your website details so Claude can make changes directly to your site.
          </p>

          <div className="space-y-4">
            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={config.website_url}
                onChange={e => setConfig({ ...config, website_url: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your live website URL
              </p>
            </div>

            {/* GitHub Repository */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={config.github_repo_url}
                onChange={e => setConfig({ ...config, github_repo_url: e.target.value })}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                GitHub repository where your code is hosted
              </p>
            </div>

            {/* GitHub Branch */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Main Branch Name
              </label>
              <input
                type="text"
                value={config.github_branch}
                onChange={e => setConfig({ ...config, github_branch: e.target.value })}
                placeholder="main"
                className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usually "main" or "master"
              </p>
            </div>

            {/* Vercel Project Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vercel Project Name
              </label>
              <input
                type="text"
                value={config.vercel_project_name}
                onChange={e => setConfig({ ...config, vercel_project_name: e.target.value })}
                placeholder="my-website"
                className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your Vercel project name (for preview URLs)
              </p>
            </div>

            {/* Vercel Team Slug */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vercel Team Slug (Optional)
              </label>
              <input
                type="text"
                value={config.vercel_team_slug}
                onChange={e => setConfig({ ...config, vercel_team_slug: e.target.value })}
                placeholder="my-team"
                className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank if using personal account
              </p>
            </div>

            {/* Public Folder Path */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Public Folder Path
              </label>
              <input
                type="text"
                value={config.public_folder_path}
                onChange={e => setConfig({ ...config, public_folder_path: e.target.value })}
                placeholder="/public"
                className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Path to your project's public folder
              </p>
            </div>

            {/* Images Folder Path */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Images Folder Path
              </label>
              <input
                type="text"
                value={config.images_folder_path}
                onChange={e => setConfig({ ...config, images_folder_path: e.target.value })}
                placeholder="/public/images"
                className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Where uploaded images will be stored
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
              {saved && (
                <span className="text-foreground font-semibold">✓ Saved!</span>
              )}
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recent Uploads
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Images you've uploaded through the chat interface
          </p>

          {uploadedImages.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No images uploaded yet. Drag and drop images in the chat to upload.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map(img => (
                <div
                  key={img.id}
                  className="border border-border rounded-lg p-2 bg-muted/30"
                >
                  <div className="aspect-square bg-background rounded mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={`/api/portal/images/${img.stored_filename}`}
                      alt={img.original_filename}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-foreground truncate">
                    {img.original_filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(img.file_size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
