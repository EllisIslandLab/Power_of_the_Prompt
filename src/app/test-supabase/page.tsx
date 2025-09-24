"use client"

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      
      // Test basic connection - just select all records
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })

      if (error) {
        setResult(`❌ Error: ${error.message}`)
      } else {
        setResult(`✅ Connection successful! Users table exists with ${count || 0} records.`)
      }
    } catch (err) {
      setResult(`❌ Connection failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      
      // Test auth
      const { data: session } = await supabase.auth.getSession()
      setResult(`Auth status: ${session.session ? '✅ Signed in' : '⚪ Not signed in'}`)
    } catch (err) {
      setResult(`❌ Auth failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Supabase Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </button>
          
          <button
            onClick={testAuth}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth Status'}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
            <pre className="text-sm whitespace-pre-wrap text-black font-mono">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}