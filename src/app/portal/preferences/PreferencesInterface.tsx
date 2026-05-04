'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface PreferencesInterfaceProps {
  user: any
  clientAccount: any
  preferences: any
}

export default function PreferencesInterface({
  user,
  clientAccount,
  preferences: initialPreferences,
}: PreferencesInterfaceProps) {
  const [preferences, setPreferences] = useState(
    initialPreferences || {
      auto_deploy_enabled: false,
      notification_email_enabled: true,
      budget_warning_threshold: 2.0,
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
        .from('client_preferences')
        .upsert({
          client_account_id: clientAccount.id,
          auto_deploy_enabled: preferences.auto_deploy_enabled,
          notification_email_enabled: preferences.notification_email_enabled,
          budget_warning_threshold: preferences.budget_warning_threshold,
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Portal
          </button>
        </div>

        {/* Preferences Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Auto-deploy */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Auto-Deploy Changes
                </h3>
                <p className="text-sm text-gray-600">
                  Automatically merge approved changes to production without manual review.
                  When disabled, you'll be asked to approve each deployment.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences.auto_deploy_enabled}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      auto_deploy_enabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Receive email notifications for deployments, budget warnings, and system updates.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences.notification_email_enabled}
                  onChange={e =>
                    setPreferences({
                      ...preferences,
                      notification_email_enabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Budget Warning Threshold */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Budget Warning Threshold
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get notified when your account balance drops below this amount.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-gray-700">$</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={preferences.budget_warning_threshold}
                onChange={e =>
                  setPreferences({
                    ...preferences,
                    budget_warning_threshold: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
            {saved && (
              <span className="text-green-600 font-semibold">✓ Saved!</span>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="text-gray-900 font-medium">{user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900 font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Created:</span>
              <span className="text-gray-900 font-medium">
                {new Date(clientAccount?.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trial Status:</span>
              <span className="text-gray-900 font-medium capitalize">
                {clientAccount?.trial_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
