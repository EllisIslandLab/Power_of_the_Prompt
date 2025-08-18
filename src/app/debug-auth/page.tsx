"use client"

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function DebugAuthPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const checkAuthStatus = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      let output = `Auth Status Check:\n\n`
      
      if (error) {
        output += `Session Error: ${error.message}\n`
      }
      
      if (session?.user) {
        output += `✅ User is signed in\n`
        output += `Email: ${session.user.email}\n`
        output += `User ID: ${session.user.id}\n`
        output += `Email confirmed: ${session.user.email_confirmed_at ? 'Yes' : 'No'}\n`
        output += `Created: ${session.user.created_at}\n`
        output += `Last sign in: ${session.user.last_sign_in_at || 'Never'}\n`
      } else {
        output += `❌ No user signed in\n`
      }
      
      setResult(output)
    } catch (err) {
      setResult(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
      setResult('Signed out successfully')
    } catch (err) {
      setResult(`Sign out error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Debug Auth Status</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={checkAuthStatus}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Auth Status'}
          </button>
          
          <button
            onClick={signOut}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded-lg border">
            <pre className="text-sm whitespace-pre-wrap text-black font-mono">{result}</pre>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Navigate to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><a href="/portal" className="text-blue-600 hover:underline">/portal</a> - Main portal</li>
            <li><a href="/auth/signin" className="text-blue-600 hover:underline">/auth/signin</a> - Sign in page</li>
            <li><a href="/auth/signup" className="text-blue-600 hover:underline">/auth/signup</a> - Sign up page</li>
          </ul>
        </div>
      </div>
    </div>
  )
}